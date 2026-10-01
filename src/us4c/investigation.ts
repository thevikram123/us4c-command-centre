import type { Case, Mission } from "./data";

export type SourceRecord = {
  id: string;
  source: string;
  reference: string;
  name: string;
  alias: string;
  identifier: string;
  kind: string;
  phone: string;
  locality: string;
  observed: string;
  quality: number;
  detail: string;
};
export type AuditEvent = {
  id: string;
  at: string;
  actor: string;
  action: string;
  detail: string;
  stage: string;
};
export type Investigation = {
  version: 2;
  step: number;
  completed: string[];
  records: SourceRecord[];
  selected: string[];
  queried: boolean;
  accepted: string[];
  excluded: string[];
  canonicalId: string;
  lockReason: string;
  locked: boolean;
  published: boolean;
  scope: string;
  evidenceDecision: Record<string, string>;
  checks: Record<string, boolean>;
  findings: Record<string, string>;
  tasks: {
    id: string;
    agency: string;
    task: string;
    status: string;
    reference: string;
  }[];
  audit: AuditEvent[];
  outcome: string;
  followUp: string;
};
export const flowSteps: Record<Mission, string[]> = {
  fraud: [
    "Complaint intake",
    "Fusion query",
    "Entity resolution",
    "De-duplication",
    "Watchlist publishing",
    "Transaction search",
    "Evidence verification",
    "Money trail",
    "Risk assessment",
    "Jurisdiction review",
    "Financial coordination",
    "Resolution",
  ],
  safety: [
    "Protection intake",
    "Fusion query",
    "Entity resolution",
    "De-duplication",
    "Restricted intelligence",
    "Evidence search",
    "Threat verification",
    "Account correlation",
    "Protection assessment",
    "Location review",
    "Protection coordination",
    "Resolution",
  ],
  content: [
    "Content referral",
    "Fusion query",
    "Entity resolution",
    "De-duplication",
    "Intelligence publishing",
    "Content search",
    "Context verification",
    "Propagation analysis",
    "Classification review",
    "Geographic context",
    "Platform coordination",
    "Resolution",
  ],
  distress: [
    "Emergency intake",
    "Fusion query",
    "Entity resolution",
    "De-duplication",
    "Restricted case profile",
    "Location evidence",
    "Urgency verification",
    "Contact correlation",
    "Response assessment",
    "Location confirmation",
    "Resource coordination",
    "Resolution",
  ],
};
export const domainChecks: Record<
  Mission,
  {
    title: string;
    checks: string[];
    fields: { label: string; value: string }[];
  }
> = {
  fraud: {
    title: "Transaction trail & financial response",
    checks: [
      "Match UTR against the debit receipt",
      "Verify beneficiary account and payment handle",
      "Reconcile onward transfers with remaining balance",
      "Review freeze acknowledgement and amount",
    ],
    fields: [
      { label: "Primary transfer", value: "₹50,000 · 01 Oct, 09:58 IST" },
      { label: "Layer 1", value: "₹31,500 to account ••4821 · 10:02 IST" },
      { label: "Layer 2", value: "₹7,000 to account ••7706 · 10:04 IST" },
      { label: "Amount on hold", value: "₹38,500 · ACK/FI/1042/02" },
    ],
  },
  safety: {
    title: "Threat assessment & victim protection",
    checks: [
      "Preserve message timestamps and original profile URLs",
      "Separate confirmed identifiers from shared display names",
      "Assess address disclosure and repeated contact",
      "Record safe contact preference and protection plan",
    ],
    fields: [
      {
        label: "Reported conduct",
        value: "Impersonation, repeated threats and address disclosure",
      },
      { label: "Evidence window", value: "30 Sep 21:14 to 01 Oct 09:46 IST" },
      {
        label: "Affected accounts",
        value: "@northlane.help / @northlane.support",
      },
      {
        label: "Contact preference",
        value: "Outreach through assigned women safety officer",
      },
    ],
  },
  content: {
    title: "Context, provenance & propagation",
    checks: [
      "Compare key frames with the original archived upload",
      "Review transcript and OCR against source material",
      "Distinguish reposts from the original publisher",
      "Record classification rationale and supervisor decision",
    ],
    fields: [
      { label: "Media", value: "Hindi video · 01:42 · 720p" },
      {
        label: "Earlier upload",
        value: "Archive reference OSINT/0930/16 · 30 Sep 17:18 IST",
      },
      {
        label: "Propagation",
        value: "6 archived posts across 3 account groups",
      },
      {
        label: "Context mismatch",
        value: "Current caption attributes an earlier event to a new location",
      },
    ],
  },
  distress: {
    title: "Urgency, welfare & response readiness",
    checks: [
      "Review the exact statement and immediate-time reference",
      "Attempt contact through the authorised channel",
      "Validate landmark using independent location evidence",
      "Record supervisor decision and responder safety instructions",
    ],
    fields: [
      {
        label: "Referral",
        value: "Immediate welfare concern reported by a family member",
      },
      { label: "Last contact", value: "01 Oct · 09:41 IST" },
      {
        label: "Reported landmark",
        value: "Riverfront access road near Sector 4",
      },
      {
        label: "Resources",
        value: "Patrol P-23 / ambulance A-09 · awaiting acknowledgement",
      },
    ],
  },
};

// These are authored exercise records. Real cases start empty and accept documented source records.
export function exerciseRecords(item: Case): SourceRecord[] {
  if (
    !item.isDemo ||
    ![
      "US4C-2026-1042",
      "US4C-2026-1041",
      "US4C-2026-1040",
      "US4C-2026-1039",
      "US4C-2026-1038",
    ].includes(item.id)
  )
    return [];
  const base =
    item.mission === "fraud"
      ? item.id.endsWith("1038")
        ? [
            "Parcel Assist",
            "parcelassist.pay@upi",
            "UPI",
            "••9018",
            "Transaction ledger",
          ]
        : [
            "Aarav Enterprises",
            "aarav.pay@upi",
            "UPI",
            "••1904",
            "Transaction ledger",
          ]
      : item.mission === "safety"
        ? [
            "Northlane Support",
            "northlane.help",
            "Platform account",
            "••1904",
            "Complaint evidence",
          ]
        : item.mission === "content"
          ? [
              "City Update Desk",
              "cityupdates.local",
              "Publisher account",
              "••0836",
              "Open-source archive",
            ]
          : [
              "Referral subject R-39",
              "contact-r39",
              "Contact reference",
              "••2648",
              "Emergency referral",
            ];
  return [
    {
      id: "REC-01",
      source: base[4],
      reference: `${item.id}/E-01`,
      name: base[0],
      alias: base[0],
      identifier: base[1],
      kind: base[2],
      phone: base[3],
      locality: item.location,
      observed: "2026-10-01T09:58",
      quality: 88,
      detail:
        item.mission === "fraud"
          ? "Payment receipt: ₹50,000 debit; merchant display name differs from beneficiary name."
          : "Original referral and preserved identifiers.",
    },
    {
      id: "REC-02",
      source:
        item.mission === "fraud"
          ? "Institution response"
          : "Archived source record",
      reference: `${item.id}/E-02`,
      name: base[0] + " Services",
      alias: base[0].toUpperCase(),
      identifier: base[1].toUpperCase(),
      kind: base[2],
      phone: base[3],
      locality: item.location,
      observed: "2026-10-01T10:14",
      quality: 96,
      detail:
        "Same normalized primary identifier; organisation suffix requires operator review.",
    },
    {
      id: "REC-03",
      source: "Internal case register",
      reference: "INT/2026/0918",
      name: base[0],
      alias: base[0],
      identifier: base[1],
      kind: base[2],
      phone: "",
      locality: "District not recorded",
      observed: "2026-09-30T18:12",
      quality: 72,
      detail:
        "Earlier reference contains matching identifier; missing contact and locality.",
    },
    {
      id: "REC-04",
      source: "Open-source archive",
      reference: "OSINT/2026/1001/07",
      name: base[0],
      alias: base[0],
      identifier: base[1] + ".backup",
      kind: base[2],
      phone: "••9027",
      locality: "Unverified",
      observed: "2026-10-01T09:46",
      quality: 54,
      detail:
        "Display name match only. Different identifier: keep separate unless independently corroborated.",
    },
    {
      id: "REC-05",
      source: "Analyst extraction",
      reference: `${item.id}/E-03`,
      name: base[0] + " Services",
      alias: base[0] + " Official",
      identifier: base[1],
      kind: base[2],
      phone: base[3],
      locality: item.location,
      observed: "2026-10-01T10:08",
      quality: 81,
      detail:
        "Extracted text duplicates the primary source; retain provenance when merging.",
    },
  ];
}
export function initialInvestigation(item: Case): Investigation {
  return {
    version: 2,
    step: 0,
    completed: [],
    records: exerciseRecords(item),
    selected: [],
    queried: false,
    accepted: [],
    excluded: [],
    canonicalId: "",
    lockReason: "",
    locked: false,
    published: false,
    scope: "Assigned investigation team",
    evidenceDecision: {},
    checks: {},
    findings: {},
    tasks: item.actions.map((a, i) => ({
      id: `TASK-${i + 1}`,
      ...a,
      reference: "",
    })),
    audit: [],
    outcome: "",
    followUp: "",
  };
}
export function normalizeIdentifier(value: string) {
  return value.normalize("NFKC").trim().toLowerCase().replace(/\s+/g, "");
}
export function clusterRecords(records: SourceRecord[]) {
  const groups = new Map<string, SourceRecord[]>();
  for (const record of records) {
    const identifier = normalizeIdentifier(record.identifier);
    const key = identifier
      ? `${record.kind.toLowerCase()}::${identifier}`
      : `unresolved::${record.id}`;
    groups.set(key, [...(groups.get(key) || []), record]);
  }
  return [...groups.values()].map((records, index) => ({
    id: `CLU-${index + 1}`,
    records,
    agreements:
      records.length > 1
        ? [
            "Exact normalized primary identifier",
            `${new Set(records.map((r) => r.source)).size} source references`,
          ]
        : ["Single source; no independent linkage"],
    conflicts: [
      ...(new Set(records.map((r) => r.name)).size > 1
        ? ["Name / organisation suffix differs"]
        : []),
      ...(new Set(records.map((r) => r.locality)).size > 1
        ? ["Location incomplete or inconsistent"]
        : []),
    ],
    score: Math.round(
      records.reduce((sum, r) => sum + r.quality, 0) / records.length,
    ),
  }));
}
export function canonicalProfile(state: Investigation) {
  const records = state.records.filter(
    (r) => state.accepted.includes(r.id) && !state.excluded.includes(r.id),
  );
  const canonical = records.find((r) => r.id === state.canonicalId);
  return {
    canonical,
    records,
    aliases: [...new Set(records.map((r) => r.alias).filter(Boolean))],
    sources: [...new Set(records.map((r) => r.source))],
    removed: state.accepted.length - records.length,
  };
}
export function gateReason(state: Investigation, item: Case): string {
  const { step } = state;
  if (step === 0 && !state.checks.intake)
    return "Confirm the intake record and evidence references.";
  if (step === 1 && (!state.queried || !state.selected.length))
    return "Run the query and select records for entity resolution.";
  if (step === 2 && !state.accepted.length)
    return "Accept a cluster after reviewing agreements and conflicts.";
  if (step === 3 && !state.locked)
    return "Select the canonical record, document the reason and lock the profile.";
  if (step === 4 && !state.published)
    return "Publish the reviewed profile to the case intelligence register.";
  if (step === 5 && !state.checks.search)
    return "Review search results and record the evidence scope.";
  if (
    step === 6 &&
    !item.evidence.every((_, i) =>
      ["Verified", "Rejected"].includes(state.evidenceDecision[String(i)]),
    )
  )
    return "Verify or reject every evidence entry with a review note.";
  if (step === 7 && !state.checks.correlation)
    return "Review the relationships and record a correlation finding.";
  if (
    step === 8 &&
    !domainChecks[item.mission].checks.every(
      (_, i) => state.checks[`domain-${i}`],
    )
  )
    return "Complete the mission assessment checks.";
  if (
    step === 9 &&
    (!state.checks.location || !state.findings.location?.trim())
  )
    return "Record location confidence and confirm jurisdiction.";
  if (
    step === 10 &&
    (!state.tasks.length ||
      state.tasks.some((t) => t.status !== "Completed" || !t.reference.trim()))
  )
    return "Record a completion reference for each coordination task.";
  if (step === 11 && (!state.outcome.trim() || !state.followUp.trim()))
    return "Record the outcome and follow-up owner before closure.";
  return "";
}
