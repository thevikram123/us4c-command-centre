import { describe, it, expect } from "vitest";
import { seedCases } from "./data";
import {
  canonicalProfile,
  clusterRecords,
  gateReason,
  initialInvestigation,
} from "./investigation";
describe("Investigation identity and review boundaries", () => {
  it("links normalized identifiers while keeping an alias-only lookalike separate", () => {
    const records = initialInvestigation(seedCases[0]).records;
    const clusters = clusterRecords(records);
    expect(clusters).toHaveLength(2);
    expect(clusters[0].records.map((r) => r.id)).toEqual([
      "REC-01",
      "REC-02",
      "REC-03",
      "REC-05",
    ]);
    expect(clusters[1].records[0].id).toBe("REC-04");
    expect(clusters[0].conflicts).toContain(
      "Name / organisation suffix differs",
    );
  });
  it("never merges records that have no primary identifier", () => {
    const records = initialInvestigation(seedCases[0])
      .records.slice(0, 2)
      .map((r) => ({ ...r, identifier: "" }));
    expect(clusterRecords(records)).toHaveLength(2);
  });
  it("preserves alias union and source provenance without retaining excluded duplicates", () => {
    const state = initialInvestigation(seedCases[0]);
    state.accepted = ["REC-01", "REC-02", "REC-03", "REC-05"];
    state.excluded = ["REC-05"];
    state.canonicalId = "REC-02";
    const profile = canonicalProfile(state);
    expect(profile.records).toHaveLength(3);
    expect(profile.sources).toContain("Institution response");
    expect(profile.removed).toBe(1);
    expect(profile.canonical?.id).toBe("REC-02");
    expect(profile.aliases).not.toContain("Aarav Enterprises Official");
  });
  it("blocks publication progression until canonical identity is locked", () => {
    const state = initialInvestigation(seedCases[0]);
    state.step = 3;
    expect(gateReason(state, seedCases[0])).toMatch(/lock/);
    state.locked = true;
    expect(gateReason(state, seedCases[0])).toBe("");
    state.step = 4;
    expect(gateReason(state, seedCases[0])).toMatch(/Publish/);
  });
  it("holds evidence review when any decision remains unresolved", () => {
    const state = initialInvestigation(seedCases[0]);
    state.step = 6;
    state.evidenceDecision = {
      "0": "Verified",
      "1": "Further review",
      "2": "Rejected",
    };
    expect(gateReason(state, seedCases[0])).toMatch(/every evidence/);
    state.evidenceDecision["1"] = "Rejected";
    expect(gateReason(state, seedCases[0])).toBe("");
  });
  it("requires task completion references and a follow-up owner before closure", () => {
    const state = initialInvestigation(seedCases[0]);
    state.step = 10;
    state.tasks = state.tasks.map((t) => ({
      ...t,
      status: "Completed",
      reference: "",
    }));
    expect(gateReason(state, seedCases[0])).toMatch(/completion reference/);
    state.tasks = state.tasks.map((t) => ({ ...t, reference: "ACK/QA/01" }));
    expect(gateReason(state, seedCases[0])).toBe("");
    state.step = 11;
    state.outcome = "Investigation handed over";
    expect(gateReason(state, seedCases[0])).toMatch(/follow-up/);
    state.followUp = "Assigned officer, 02 Oct";
    expect(gateReason(state, seedCases[0])).toBe("");
  });
  it("starts real private cases without invented source records", () => {
    const state = initialInvestigation({ ...seedCases[0], isDemo: false });
    expect(state.records).toEqual([]);
  });
});
