import { useState } from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  Database,
  FileText,
  GitBranch,
  Layers3,
  MapPin,
  Search,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import type { Case } from "./data";
import { nowIST } from "./data";
const fusionSteps = [
  "Detection",
  "Correlation",
  "DB Fusion",
  "Entity profile",
  "AI summary",
  "GIS view",
  "Command review",
  "Response",
  "Resolution",
];
const systemList = [
  "CCTNS / Digital Police Portal",
  "NCRB",
  "ICJS",
  "e-Courts",
  "SARATHI",
  "VAHAN",
  "Financial records",
  "Telecom / device records",
  "Open-source intelligence",
];
export default function FusionWorkflow({
  item,
  cases,
  save,
  saving,
  openChat,
}: {
  item: Case;
  cases: Case[];
  save: (item: Case) => Promise<void>;
  saving: boolean;
  openChat: () => void;
}) {
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [inspected, setInspected] = useState(false);
  const fusion = item.fusion || { step: 0, reviewed: [], matches: [] };
  const current = fusion.step;
  const results = query.trim()
    ? cases.filter(
        (c) =>
          c.id !== item.id &&
          JSON.stringify(c.entities)
            .toLowerCase()
            .includes(query.trim().toLowerCase()),
      )
    : [];
  const advance = async () => {
    setError("");
    try {
      await save({
        ...item,
        fusion: {
          step: Math.min(current + 1, 8),
          reviewed: [...new Set([...fusion.reviewed, fusionSteps[current]])],
          matches: current === 2 ? results.map((c) => c.id) : fusion.matches,
        },
        timeline: [
          ...item.timeline,
          {
            time: nowIST(),
            text: `Database fusion workflow: operator reviewed ${fusionSteps[current]}`,
          },
        ],
      });
      setInspected(false);
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const canAdvance =
    current === 2 ? inspected : current >= 6 ? inspected : true;
  return (
    <section className="panel">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">RETAINED INVESTIGATION PIPELINE</span>
          <h2>Database fusion workflow</h2>
        </div>
        <Database size={22} className="cyan" />
      </div>
      <div className="fusion-stepper">
        {fusionSteps.map((s, i) => (
          <div
            className={
              i === current
                ? "current"
                : fusion.reviewed.includes(s)
                  ? "complete"
                  : ""
            }
            key={s}
          >
            <span>
              {fusion.reviewed.includes(s) ? <Check size={12} /> : i + 1}
            </span>
            <strong>{s}</strong>
            <ChevronRight size={11} />
          </div>
        ))}
      </div>
      <div className="workflow-content">
        {current === 0 && (
          <>
            <div className="workflow-icon">
              <FileText size={30} />
            </div>
            <h3>Citizen / digital signal intake</h3>
            <p>{item.summary}</p>
            <div className="entity-fields">
              <div>
                <span>Reporting source</span>
                <strong>{item.source}</strong>
                <small>{item.createdAt}</small>
              </div>
              <div>
                <span>Evidence received</span>
                <strong>{item.evidence.length} registered items</strong>
                <small>
                  Original evidence requires independent preservation.
                </small>
              </div>
            </div>
          </>
        )}
        {current === 1 && (
          <>
            <div className="workflow-icon">
              <GitBranch size={30} />
            </div>
            <h3>Correlate identifiers & evidence</h3>
            <p>
              Carry extracted identifiers into fusion with source and confidence
              intact. Matching an identifier is a lead, not proof of identity.
            </p>
            <div className="entity-fields">
              {item.entities.length ? (
                item.entities.map((e) => (
                  <div key={e.label}>
                    <span>{e.label}</span>
                    <strong>{e.value}</strong>
                    <small>{e.confidence}</small>
                  </div>
                ))
              ) : (
                <div>
                  <span>Identifier review</span>
                  <strong>No structured identifiers recorded</strong>
                  <small>
                    Review original evidence before making correlations.
                  </small>
                </div>
              )}
            </div>
          </>
        )}
        {current === 2 && (
          <>
            <div className="workflow-icon">
              <Database size={30} />
            </div>
            <h3>Multi-database fusion query</h3>
            <p>
              Retained source systems with cyber-specific financial, telecom and
              OSINT inputs. External sources require authorised connectors.
              Workspace matching queries the records already accessible to you.
            </p>
            <div className="db-source-grid">
              {systemList.map((s) => (
                <div key={s}>
                  <Database size={17} />
                  <strong>{s}</strong>
                  <small>External connector not configured</small>
                </div>
              ))}
            </div>
            <label className="search">
              <Search size={16} />
              <input
                aria-label="Fusion identifier search"
                placeholder="Match an identifier against workspace case entities…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setInspected(false);
                }}
              />
            </label>
            <button className="button" onClick={() => setInspected(true)}>
              <Layers3 size={16} />
              Run workspace fusion
            </button>
            {inspected && (
              <div className="fusion-results">
                <TagLine />
                <h4>
                  {query.trim()
                    ? `${results.length} matching workspace case${results.length !== 1 ? "s" : ""}`
                    : "No identifier entered; no matching query performed"}
                </h4>
                {results.map((c) => (
                  <p key={c.id}>
                    {c.id} · {c.title} · lead requires review
                  </p>
                ))}
                <p>
                  Source: accessible case entities. Government, banking and
                  telecom databases were not queried.
                </p>
              </div>
            )}
          </>
        )}
        {current === 3 && (
          <>
            <div className="workflow-icon">
              <ShieldCheck size={30} />
            </div>
            <h3>Source-aware entity profile</h3>
            <p>
              Preserve reported identifiers, verified evidence and unverified
              relationships separately.
            </p>
            <div className="entity-fields">
              {item.entities.map((e) => (
                <div key={e.label}>
                  <span>{e.label}</span>
                  <strong>{e.value}</strong>
                  <small>{e.confidence}</small>
                </div>
              ))}
            </div>
            <p>
              {fusion.matches.length} related workspace leads recorded. Links
              require investigator validation.
            </p>
          </>
        )}
        {current === 4 && (
          <>
            <div className="workflow-icon">
              <Sparkles size={30} />
            </div>
            <h3>AI-assisted case summarisation</h3>
            <p>
              Review the evidence context and draft an investigation brief
              through the command assistant. Sample insights are labelled;
              assistant output stays subject to human review.
            </p>
            {item.insights.map((i) => (
              <div className="fusion-results" key={i.text}>
                <p>{i.text}</p>
                <small>
                  {i.source} · {i.confidence}
                </small>
              </div>
            ))}
            <button className="button" onClick={openChat}>
              <Sparkles size={16} />
              Prepare an AI brief
            </button>
          </>
        )}
        {current === 5 && (
          <>
            <div className="workflow-icon">
              <MapPin size={30} />
            </div>
            <h3>GIS & location intelligence</h3>
            <p>
              Review reported geography and response jurisdiction before
              coordinating resources.
            </p>
            <div className="location-workspace">
              <div className="map-grid">
                <MapPin size={40} />
                <strong>{item.location}</strong>
                <span>Reported district · exact coordinates unverified</span>
                <small>Location schematic · no live resource tracking</small>
              </div>
              <div>
                <h4>Location confidence</h4>
                <p>
                  {item.entities.find((e) => e.label === "Location confidence")
                    ?.value || "Reported location; coordinates not recorded"}
                </p>
                <h4>Response resources</h4>
                {item.actions.map((a) => (
                  <p key={a.agency}>
                    {a.agency}
                    <br />
                    <small>{a.status}</small>
                  </p>
                ))}
              </div>
            </div>
          </>
        )}
        {current === 6 && (
          <>
            <div className="workflow-icon">
              <ShieldCheck size={30} />
            </div>
            <h3>Command centre review</h3>
            <p>
              Validate priority, evidence, jurisdiction and proposed
              coordination against the applicable SOP. Supervisory approval is
              recorded by the operator; the assistant does not approve
              interventions.
            </p>
            <div className="entity-fields">
              <div>
                <span>Assigned unit</span>
                <strong>{item.unit}</strong>
              </div>
              <div>
                <span>Review priority</span>
                <strong>{item.priority}</strong>
              </div>
            </div>
            <label className="review-check">
              <input
                type="checkbox"
                checked={inspected}
                onChange={(e) => setInspected(e.target.checked)}
              />
              Command review completed and recorded by the operator.
            </label>
          </>
        )}
        {current === 7 && (
          <>
            <div className="workflow-icon">
              <ArrowRight size={30} />
            </div>
            <h3>Inter-agency response</h3>
            <p>
              Prepare financial, protection, platform or welfare coordination as
              appropriate. Use the Coordination tab to record acknowledgement
              and action status.
            </p>
            {item.actions.map((a) => (
              <div className="coordination-row" key={a.agency}>
                <div>
                  <h4>{a.agency}</h4>
                  <p>{a.task}</p>
                </div>
                <span className="tag">{a.status}</span>
              </div>
            ))}
            <label className="review-check">
              <input
                type="checkbox"
                checked={inspected}
                onChange={(e) => setInspected(e.target.checked)}
              />
              Response requirements reviewed; coordination will be tracked in
              the case register.
            </label>
          </>
        )}
        {current === 8 && (
          <>
            <div className="workflow-icon">
              <ShieldCheck size={30} />
            </div>
            <h3>Resolution & continuity</h3>
            <p>{item.outcome}</p>
            <div className="notice">
              Complete the operational case workflow with a verified outcome,
              citizen communication, handover and follow-up. Reaching this
              review screen does not resolve the case automatically.
            </div>
          </>
        )}
      </div>
      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {current < 8 && (
        <div className="workflow-footer">
          <span>
            Step {current + 1} / 9 · {fusionSteps[current]}
          </span>
          <button
            className="button primary"
            disabled={saving || !canAdvance}
            onClick={() => void advance()}
          >
            Review & continue
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </section>
  );
}
function TagLine() {
  return <span className="tag">Workspace evidence match</span>;
}
