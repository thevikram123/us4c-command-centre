import { lazy, Suspense, useEffect, useState } from "react";
import {
  HashRouter,
  NavLink,
  Route,
  Routes,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Activity,
  ArrowDown,
  ArrowRight,
  ArrowUpRight,
  Bell,
  BookOpen,
  Check,
  ChevronRight,
  CircleHelp,
  Database,
  Download,
  FileText,
  Fingerprint,
  GitBranch,
  Layers3,
  LayoutDashboard,
  Loader2,
  LogOut,
  MessageSquare,
  Network,
  Plus,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  Wallet,
  X,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import {
  Case,
  missions,
  Mission,
  money,
  nowIST,
  seedCases,
  stages,
} from "./data";
import {
  database,
  hasDemoCache,
  loadPublic,
  loadDemo,
  loadRemote,
  saveDemo,
  saveRemote,
} from "./store";
import "./cyber.css";
import "./operations.css";
import {
  flowSteps,
  initialInvestigation,
  canonicalProfile,
} from "./investigation";
const FusionWorkflow = lazy(() => import("./FusionWorkflow"));
const OperationsReports = lazy(() => import("./OperationsReports"));
const CommandDashboard = lazy(() => import("./CommandDashboard"));
const PortalGate = lazy(() => import("./PortalGate"));
const Chat = lazy(() => import("./CommandAssistant"));
const IntelligenceIntake = lazy(() => import("./IntelligenceIntake"));

const icons = {
  fraud: Wallet,
  safety: ShieldCheck,
  content: Network,
  distress: Activity,
};
type Workspace = {
  cases: Case[];
  user: User | null;
  saving: boolean;
  save: (item: Case) => Promise<void>;
  openChat: () => void;
};
function Tag({
  children,
  tone = "",
}: {
  children: React.ReactNode;
  tone?: string;
}) {
  return <span className={`tag ${tone.toLowerCase()}`}>{children}</span>;
}
function Panel({
  title,
  eyebrow,
  children,
  className = "",
  action,
}: {
  title: string;
  eyebrow?: string;
  children: React.ReactNode;
  className?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-heading">
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h2>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}
function Queue({ cases, filter = "all" }: { cases: Case[]; filter?: string }) {
  const [query, setQuery] = useState("");
  const [priority, setPriority] = useState("All priorities");
  const list = cases.filter(
    (c) =>
      (filter === "all" || c.mission === filter) &&
      (priority === "All priorities" || c.priority === priority) &&
      `${c.id} ${c.title} ${c.location}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="queue-tools">
        <label className="search">
          <Search size={16} />
          <input
            aria-label="Search cases"
            placeholder="Search case ID, incident or district…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <select
          aria-label="Filter priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
        >
          {["All priorities", "Critical", "High", "Medium"].map((p) => (
            <option key={p}>{p}</option>
          ))}
        </select>
      </div>
      <div className="case-list">
        {list.length ? (
          list.map((c) => {
            const Icon = icons[c.mission];
            return (
              <NavLink to={`/case/${c.id}`} key={c.id} className="case-row">
                <div className={`case-icon ${c.mission}`}>
                  <Icon size={19} />
                </div>
                <div className="case-description">
                  <span className="mono">{c.id}</span>
                  <h3>{c.title}</h3>
                  <p>
                    {c.location} <span>·</span> {c.source}
                  </p>
                </div>
                <div className="case-status">
                  <Tag tone={c.priority}>{c.priority}</Tag>
                  <span>
                    {c.stage === 5
                      ? "Resolved"
                      : flowSteps[c.mission][c.investigation?.step || 0]}
                  </span>
                </div>
                <ChevronRight size={17} />
              </NavLink>
            );
          })
        ) : (
          <div className="empty">
            <Search />
            <h3>No cases found</h3>
            <p>Try another search or register a new incident.</p>
          </div>
        )}
      </div>
    </>
  );
}
function Dashboard({ cases, openChat }: Workspace) {
  return (
    <Suspense
      fallback={<div className="ops-empty">Loading command centre…</div>}
    >
      <CommandDashboard cases={cases} openChat={openChat} />
    </Suspense>
  );
}
function MissionPage(props: Workspace) {
  const { id } = useParams();
  const m = missions.find((m) => m.id === id);
  if (!m) return <NotFound />;
  const Icon = icons[m.id];
  const c = props.cases.filter((c) => c.mission === id);
  return (
    <>
      <div className="page-intro">
        <div>
          <span className="eyebrow">
            MISSION WORKSPACE / {m.unit.toUpperCase()}
          </span>
          <h1>
            <Icon size={29} /> {m.title}
          </h1>
          <p>{m.description}</p>
        </div>
        <NavLink to={`/intake?mission=${id}`} className="button primary">
          <Plus size={16} /> New complaint
        </NavLink>
      </div>
      <div className="desk-flow">
        {flowSteps[m.id].map((s, i) => (
          <div key={s}>
            <span>{String(i + 1).padStart(2, "0")}</span>
            <strong>{s}</strong>
            {i < 5 && <ChevronRight size={16} />}
          </div>
        ))}
      </div>
      <div className="mission-details">
        <Panel title="Mission case queue" eyebrow={`${c.length} CASES`}>
          <Queue cases={props.cases} filter={id} />
        </Panel>
        <Panel title="Response playbook" eyebrow="OPERATOR GUIDANCE">
          <ol className="playbook">
            {playbooks[m.id].map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ol>
          <div className="notice">
            <ShieldCheck size={18} />
            Agency requests and interventions require operator review and the
            applicable SOP.
          </div>
        </Panel>
      </div>
    </>
  );
}
const playbooks: Record<Mission, string[]> = {
  fraud: [
    "Capture 1930 complaint, amount and transaction time.",
    "Review transcript and extracted UTR, UPI and bank identifiers.",
    "Verify mandatory fields before financial coordination.",
    "Record institution acknowledgements and verified freeze amounts.",
    "Explore money trail and linked complaints; assign investigation.",
    "Record recovery outcome and citizen communication.",
  ],
  safety: [
    "Capture victim category and immediate threat context.",
    "Preserve screenshots, URLs and message provenance.",
    "Review threat indicators and explain contributing signals.",
    "Verify identity links and relationship sources.",
    "Coordinate protection review, outreach and platform preservation.",
    "Record welfare actions, case assignment and appropriate updates.",
  ],
  content: [
    "Capture source URL, platform and original upload context.",
    "Review transcript, OCR, key frames and language analysis.",
    "Human analyst verifies context and classification.",
    "Review propagation, related accounts and evidence sources.",
    "Prepare authorised platform or legal process for review.",
    "Record monitoring, investigation and closure outcome.",
  ],
  distress: [
    "Capture the reported signal, contact and location clues.",
    "Surface urgency indicators for human validation.",
    "Confirm urgency and location confidence with a reviewer.",
    "Coordinate supervisor, patrol and medical resources.",
    "Record acknowledgements, arrival and welfare response.",
    "Record support referral, handover and follow-up.",
  ],
};
function CasePage({ cases, save, saving, openChat }: Workspace) {
  const { id } = useParams();
  const item = cases.find((c) => c.id === id);
  const [tab, setTab] = useState(
    item?.stage === 5 ? "Overview" : "Investigation",
  );
  const [review, setReview] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [outcome, setOutcome] = useState("");
  useEffect(() => {
    setReview(false);
    setNote("");
    setOutcome("");
    setTab(item?.stage === 5 ? "Overview" : "Investigation");
  }, [id, item?.stage]);
  if (!item) return <NotFound />;
  const mission = missions.find((m) => m.id === item.mission)!;
  const mutate = async (next: Case) => {
    setError("");
    try {
      const inv = next.investigation || initialInvestigation(next);
      const newEvidence = next.evidence.length !== item.evidence.length;
      const auditEvent = {
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        actor: item.isDemo ? "Training operator" : "Signed-in operator",
        action: newEvidence
          ? "Evidence reference registered"
          : "Case metadata updated",
        detail: next.timeline.slice(-1)[0]?.text || next.id,
        stage: "Case register",
      };
      await save({
        ...next,
        investigation: {
          ...inv,
          ...(newEvidence && inv.step > 6
            ? {
                step: 6,
                completed: inv.completed.filter(
                  (stage) => flowSteps[item.mission].indexOf(stage) < 6,
                ),
              }
            : {}),
          audit: [...inv.audit, auditEvent].slice(-120),
        },
      });
    } catch (e) {
      setError((e as Error).message);
    }
  };
  const advance = async () => {
    if (
      item.stage >= 5 ||
      (item.stage >= 2 && !review) ||
      (item.stage === 4 && !outcome.trim())
    )
      return;
    await mutate({
      ...item,
      stage: item.stage + 1,
      outcome: outcome.trim() || item.outcome,
      timeline: [
        ...item.timeline,
        {
          time: nowIST(),
          text: `Operator reviewed and moved case to ${stages[item.stage + 1]}${outcome ? `: ${outcome}` : ""}`,
        },
      ],
    });
    setReview(false);
  };
  return (
    <>
      <NavLink to={`/mission/${item.mission}`} className="back-link">
        ← {mission.title}
      </NavLink>
      <div className="page-intro case-intro">
        <div>
          <span className="eyebrow">
            {item.id} / {item.location.toUpperCase()}
          </span>
          <h1>{item.title}</h1>
          <p>
            {item.unit} <span>·</span> {item.source}
          </p>
        </div>
        <div className="stack">
          <Tag tone={item.priority}>{item.priority} priority</Tag>
          <Tag>{item.isDemo ? "Training case" : "Private case"}</Tag>
        </div>
      </div>
      <div className="case-ribbon">
        <div>
          <span>REPORTED AT</span>
          <strong>
            {new Date(item.createdAt).toLocaleString("en-IN", {
              timeZone: "Asia/Kolkata",
            })}{" "}
            IST
          </strong>
        </div>
        <div>
          <span>RESPONSE WINDOW</span>
          <strong>
            {item.isDemo ? "Priority review" : "Review assignment required"}
          </strong>
        </div>
        <div>
          <span>ASSIGNED UNIT</span>
          <strong>{item.unit}</strong>
        </div>
        {item.amount > 0 && (
          <div>
            <span>REPORTED / FROZEN</span>
            <strong>
              {money(item.amount)} /{" "}
              <b className="cyan">{money(item.frozen)}</b>
            </strong>
          </div>
        )}
      </div>
      <div className="tabs" role="tablist">
        {[
          "Overview",
          "Investigation",
          "Evidence",
          "Entity graph",
          "Coordination",
          "Timeline",
        ].map((t) => (
          <button
            key={t}
            role="tab"
            aria-selected={tab === t}
            className={tab === t ? "selected" : ""}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </div>
      <div
        className={
          tab === "Investigation" ? "case-grid investigation-case" : "case-grid"
        }
      >
        <div>
          {tab === "Overview" && (
            <>
              <Panel title="Incident context" eyebrow="WHAT HAPPENED">
                <p className="body-copy">{item.summary}</p>
                <div className="entity-fields">
                  {item.entities.map((e) => (
                    <div key={e.label}>
                      <span>{e.label}</span>
                      <strong>{e.value}</strong>
                      <small>{e.confidence}</small>
                    </div>
                  ))}
                </div>
              </Panel>
              <Panel
                title="AI-assisted assessment"
                eyebrow="REVIEW REQUIRED"
                className="ai-panel"
              >
                <div className="notice">
                  <MessageSquare size={18} />
                  Review the analyst findings against the referenced evidence
                  before approving action.
                </div>
                {item.insights.map((ins, i) => (
                  <div className="insight" key={i}>
                    <div>
                      <MessageSquare size={16} />
                      <p>{ins.text}</p>
                    </div>
                    <span>
                      {ins.confidence} <b>·</b> Source: {ins.source}
                    </span>
                  </div>
                ))}
                <button onClick={openChat} className="text-link">
                  Ask the command assistant <ArrowRight size={14} />
                </button>
              </Panel>
            </>
          )}
          {tab === "Investigation" && (
            <Suspense
              fallback={
                <div className="ops-empty">
                  Loading investigation workspace…
                </div>
              }
            >
              <FusionWorkflow
                item={item}
                cases={cases}
                save={save}
                saving={saving}
                openChat={openChat}
              />
            </Suspense>
          )}
          {tab === "Evidence" && (
            <Panel title="Evidence register" eyebrow="SOURCE + PROVENANCE">
              <p className="body-copy">
                Evidence references, preservation status and source provenance
                stay with the case. Register each original attachment through
                the authorised evidence system.
              </p>
              {item.evidence.map((e, i) => (
                <div className="evidence-row" key={i}>
                  <FileText size={22} />
                  <div>
                    <h3>{e.name}</h3>
                    <p>
                      {e.type} · {e.source} · {e.time}
                    </p>
                  </div>
                  <Tag>{e.status}</Tag>
                </div>
              ))}
              <form
                className="inline-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = new FormData(e.currentTarget);
                  const name = String(form.get("name")).trim();
                  const source = String(form.get("source")).trim();
                  if (!name || !source) return;
                  await mutate({
                    ...item,
                    evidence: [
                      ...item.evidence,
                      {
                        name,
                        source,
                        type: "Operator note",
                        status: "Registered · original not uploaded",
                        time: nowIST(),
                      },
                    ],
                    timeline: [
                      ...item.timeline,
                      {
                        time: nowIST(),
                        text: `Evidence metadata registered: ${name}`,
                      },
                    ],
                  });
                }}
              >
                <h3>Add evidence metadata</h3>
                <label>
                  Item description
                  <input
                    name="name"
                    maxLength={160}
                    required
                    placeholder="e.g. Preservation request reference"
                  />
                </label>
                <label>
                  Source / reference
                  <input
                    name="source"
                    maxLength={300}
                    required
                    placeholder="Record source and reference number"
                  />
                </label>
                <button className="button" disabled={saving}>
                  <Plus size={15} /> Register metadata
                </button>
              </form>
            </Panel>
          )}
          {tab === "Entity graph" && (
            <Panel
              title={
                item.mission === "fraud"
                  ? "Money trail workspace"
                  : item.mission === "content"
                    ? "Propagation workspace"
                    : "Relationship workspace"
              }
              eyebrow="SOURCE-AWARE CONNECTIONS"
            >
              <p className="body-copy">
                Relationships derive from retained source records. Select a
                source to inspect its provenance and review basis.
              </p>
              <EntityGraph item={item} />
            </Panel>
          )}
          {tab === "Coordination" && (
            <Panel
              title="Inter-agency action register"
              eyebrow="RECORD COORDINATION"
            >
              <div className="notice">
                <Users size={18} />
                Changes record operator coordination. They do not send requests
                or dispatch external resources.
              </div>
              {item.actions.map((a, i) => (
                <div className="coordination-row" key={i}>
                  <div>
                    <h3>{a.agency}</h3>
                    <p>{a.task}</p>
                  </div>
                  <Tag tone={a.status === "Completed" ? "success" : ""}>
                    {a.status}
                  </Tag>
                </div>
              ))}
              <button
                className="button primary"
                onClick={() => setTab("Investigation")}
              >
                Record acknowledgements in the investigation workflow{" "}
                <ArrowRight size={15} />
              </button>
            </Panel>
          )}
          {tab === "Timeline" && (
            <Panel title="Shared incident timeline" eyebrow="CASE HISTORY">
              <div className="timeline">
                {item.timeline.map((t, i) => (
                  <div key={i}>
                    <i className="dot cyan-dot" />
                    <span className="mono">{t.time}</span>
                    <p>{t.text}</p>
                  </div>
                ))}
              </div>
              <form
                className="inline-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!note.trim()) return;
                  await mutate({
                    ...item,
                    timeline: [
                      ...item.timeline,
                      { time: nowIST(), text: note.trim() },
                    ],
                  });
                  setNote("");
                }}
              >
                <label>
                  Operator note
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    required
                    maxLength={2000}
                    placeholder="Record verification, coordination or follow-up…"
                  />
                </label>
                <button className="button" disabled={saving}>
                  <Plus size={15} /> Add to timeline
                </button>
              </form>
            </Panel>
          )}
        </div>
        <aside>
          <Panel title="Investigation controls" eyebrow="OPERATOR WORKSPACE">
            <p className="body-copy">
              {item.stage === 5
                ? "Resolution and follow-up have been recorded. Review the case history and handover."
                : "Complete the source, identity, evidence and response review in the investigation workspace. Decisions retain their references and audit history."}
            </p>
            <button
              className="button primary full"
              onClick={() => setTab("Investigation")}
            >
              <GitBranch size={16} />
              Open investigation workflow
            </button>
            {error && (
              <p className="error" role="alert">
                {error}
              </p>
            )}
          </Panel>
          <Panel title="Outcome & continuity" eyebrow="MEASURABLE RESPONSE">
            <p className="body-copy">{item.outcome}</p>
            <div className="outcome-stat">
              <strong>
                {item.actions.filter((a) => a.status === "Completed").length} /{" "}
                {item.actions.length}
              </strong>
              <span>coordination actions completed</span>
            </div>
            <button className="button full" onClick={() => downloadCase(item)}>
              <Download size={15} /> Export case brief
            </button>
          </Panel>
        </aside>
      </div>
    </>
  );
}
function downloadCase(item: Case) {
  const blob = new Blob([JSON.stringify(item, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `${item.id}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}
function EntityGraph({ item }: { item: Case }) {
  const [selected, setSelected] = useState("");
  const inv = item.investigation || initialInvestigation(item);
  const profile = canonicalProfile(inv);
  const record =
    profile.records.find((r) => r.id === selected) || profile.records[0];
  if (!profile.canonical)
    return (
      <>
        <div className="ops-empty">
          <GitBranch size={28} />
          <h3>Identity resolution is pending</h3>
          <p>
            The relationship view appears after an operator accepts a source
            cluster and selects a canonical record.
          </p>
        </div>
        <div className="ops-field-grid">
          {item.entities.map((e) => (
            <div key={e.label}>
              <span>{e.label}</span>
              <strong>{e.value}</strong>
              <small>{e.confidence}</small>
            </div>
          ))}
        </div>
      </>
    );
  return (
    <>
      <div className="relationship-map">
        <div className="relationship-centre">
          <Users size={27} />
          <strong>{profile.canonical.name}</strong>
          <code>{profile.canonical.identifier}</code>
          <span className="status-chip">
            {inv.locked
              ? "Canonical identity locked"
              : "Canonical review pending"}
          </span>
        </div>
        <div className="relationship-sources">
          {profile.records.map((r) => (
            <button
              className={`graph-source-button ${record?.id === r.id ? "selected" : ""}`}
              key={r.id}
              onClick={() => setSelected(r.id)}
            >
              <Database size={17} />
              <strong>{r.source}</strong>
              <small>{r.reference}</small>
              <span>Exact identifier linkage</span>
            </button>
          ))}
        </div>
      </div>
      {record ? (
        <div className="source-detail">
          <h3>
            {record.id} · {record.source}
          </h3>
          <p>{record.detail}</p>
          <div className="ops-field-grid">
            <div>
              <span>Source reference</span>
              <strong>{record.reference}</strong>
            </div>
            <div>
              <span>Observed identifier</span>
              <strong>{record.identifier}</strong>
            </div>
            <div>
              <span>Observed time</span>
              <strong>{record.observed.replace("T", " · ")} IST</strong>
            </div>
            <div>
              <span>Review basis</span>
              <strong>{inv.lockReason || "Canonical rationale pending"}</strong>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
function Intake({ save, saving, user }: Workspace) {
  const navigate = useNavigate();
  const [mission, setMission] = useState<Mission>(
    (new URLSearchParams(window.location.hash.split("?")[1]).get(
      "mission",
    ) as Mission) || "fraud",
  );
  const [error, setError] = useState("");
  return (
    <>
      <div className="page-intro">
        <div>
          <span className="eyebrow">COMPLAINT MONITORING UNIT</span>
          <h1>Register a cyber incident</h1>
          <p>
            Register incident details, reporting source and the responsible
            operational unit.
          </p>
        </div>
        <Tag>{user ? "Private Supabase record" : "Local training record"}</Tag>
      </div>
      <form
        className="intake-form panel"
        onSubmit={async (e) => {
          e.preventDefault();
          const f = new FormData(e.currentTarget);
          const m = missions.find((x) => x.id === mission)!;
          const amount = Number(f.get("amount") || 0);
          const title = String(f.get("title")).trim();
          const summary = String(f.get("summary")).trim();
          if (!title || !summary) return;
          const item: Case = {
            id: `US4C-${crypto.randomUUID()}`,
            title,
            mission,
            priority: String(f.get("priority")) as Case["priority"],
            stage: 0,
            location: String(f.get("location")).trim(),
            source: String(f.get("source")),
            unit: m.unit,
            createdAt: new Date().toISOString(),
            amount,
            frozen: 0,
            summary,
            insights: [],
            entities:
              mission === "fraud"
                ? [
                    {
                      label: "Reported amount",
                      value: money(amount),
                      confidence: "Operator entered · unverified",
                    },
                    {
                      label: "Transaction reference",
                      value: String(f.get("utr") || "Not provided"),
                      confidence: "Needs verification",
                    },
                  ]
                : [],
            evidence: [],
            actions: [
              {
                agency: m.unit,
                task: "Review new incident",
                status: "Pending",
              },
              {
                agency: "Command Supervisor",
                task: "Review priority and coordination",
                status: "Pending",
              },
            ],
            timeline: [
              { time: nowIST(), text: "Operator registered incident" },
            ],
            outcome: "Verification, response and follow-up pending.",
            isDemo: !user,
          };
          const fields: Record<Mission, string[]> = {
            fraud: [
              "payment_handle",
              "beneficiary_account",
              "transaction_time",
            ],
            safety: ["profile_urls", "threat_window", "safe_contact"],
            content: ["content_url", "original_upload", "language"],
            distress: ["last_contact", "landmark", "safe_contact"],
          };
          item.entities.push(
            ...fields[mission]
              .filter((key) => String(f.get(key) || "").trim())
              .map((key) => ({
                label: key.replace(/_/g, " "),
                value: String(f.get(key)).trim(),
                confidence: "Operator entered; source review pending",
              })),
          );
          if (String(f.get("evidence_reference") || "").trim())
            item.evidence.push({
              name: String(
                f.get("evidence_name") || "Intake evidence reference",
              ),
              type: String(f.get("evidence_type") || "Source record"),
              status: "Registered",
              source: String(f.get("evidence_reference")),
              time: nowIST(),
            });
          item.investigation = {
            ...initialInvestigation(item),
            records: [],
            audit: [
              {
                id: crypto.randomUUID(),
                at: new Date().toISOString(),
                actor: user ? "Signed-in operator" : "Training operator",
                action: "Incident registered",
                detail: item.source + " / " + item.title,
                stage: flowSteps[mission][0],
              },
            ],
          };
          setError("");
          try {
            await save(item);
            navigate(`/case/${item.id}`);
          } catch (err) {
            setError((err as Error).message);
          }
        }}
      >
        <div className="form-grid">
          <label>
            Mission
            <select
              value={mission}
              onChange={(e) => setMission(e.target.value as Mission)}
            >
              {missions.map((m) => (
                <option value={m.id} key={m.id}>
                  {m.title}
                </option>
              ))}
            </select>
          </label>
          <label>
            Priority
            <select name="priority">
              <option>High</option>
              <option>Critical</option>
              <option>Medium</option>
            </select>
          </label>
          <label className="span-two">
            Incident title
            <input
              name="title"
              required
              maxLength={180}
              placeholder="Describe the reported incident"
            />
          </label>
          <label>
            District / location
            <input
              name="location"
              required
              maxLength={100}
              placeholder="e.g. Lucknow"
            />
          </label>
          <label>
            Reporting channel
            <select name="source">
              {[
                "1930 helpline",
                "Citizen portal",
                "Analyst referral",
                "Citizen referral",
                "Other channel",
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          {mission === "fraud" && (
            <>
              <label>
                Reported fraud amount (₹)
                <input
                  name="amount"
                  required
                  type="number"
                  min="1"
                  max="10000000000"
                  step="1"
                />
              </label>
              <label>
                Transaction reference / UTR
                <input
                  name="utr"
                  maxLength={100}
                  placeholder="Enter reference for verification"
                />
              </label>
            </>
          )}
          {(mission === "fraud"
            ? [
                {
                  name: "payment_handle",
                  label: "Beneficiary UPI / payment handle",
                },
                {
                  name: "beneficiary_account",
                  label: "Beneficiary account reference",
                },
                {
                  name: "transaction_time",
                  label: "Transaction date and time",
                },
              ]
            : mission === "safety"
              ? [
                  {
                    name: "profile_urls",
                    label: "Reported profile URLs / identifiers",
                  },
                  {
                    name: "threat_window",
                    label: "Threat period and immediate risk",
                  },
                  { name: "safe_contact", label: "Safe contact preference" },
                ]
              : mission === "content"
                ? [
                    {
                      name: "content_url",
                      label: "Original content URL / archive reference",
                    },
                    {
                      name: "original_upload",
                      label: "Earliest upload date / source",
                    },
                    { name: "language", label: "Language / media type" },
                  ]
                : [
                    {
                      name: "last_contact",
                      label: "Last contact / immediate-time reference",
                    },
                    {
                      name: "landmark",
                      label: "Last-known landmark / location source",
                    },
                    {
                      name: "safe_contact",
                      label: "Contact reference / reporter relationship",
                    },
                  ]
          ).map((field) => (
            <label key={field.name}>
              {field.label}
              <input name={field.name} required maxLength={400} />
            </label>
          ))}
          <label>
            Evidence description
            <input name="evidence_name" required maxLength={200} />
          </label>
          <label>
            Evidence source / request reference
            <input name="evidence_reference" required maxLength={200} />
          </label>
          <label>
            Evidence type
            <select name="evidence_type">
              <option>Source record</option>
              <option>Transaction receipt</option>
              <option>Message archive</option>
              <option>Media transcript</option>
              <option>Location note</option>
              <option>Institution response</option>
            </select>
          </label>
          <label className="span-two">
            Reported context
            <textarea
              name="summary"
              required
              maxLength={4000}
              rows={5}
              placeholder="What happened, who is affected, what evidence is available, and what needs urgent review?"
            />
          </label>
        </div>
        <div className="form-footer">
          <p>
            {user
              ? "Stored privately in Supabase with access restricted to your account."
              : "Demonstration mode stores data in this browser. Sign in for private database storage."}
          </p>
          <button className="button primary" disabled={saving}>
            {saving ? (
              <Loader2 className="spin" size={16} />
            ) : (
              <Plus size={16} />
            )}{" "}
            Register incident
          </button>
        </div>
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}
      </form>
    </>
  );
}
function Fusion(props: Workspace) {
  return (
    <Suspense
      fallback={<div className="ops-empty">Loading source intake…</div>}
    >
      <IntelligenceIntake {...props} />
    </Suspense>
  );
}
function Units({ cases }: Workspace) {
  const units = [
    {
      name: "Complaint Monitoring Unit",
      description: "Citizen intake, complaint triage and case continuity.",
      icon: MessageSquare,
    },
    {
      name: "State Cyber Threat Intelligence & Monitoring Hub",
      description:
        "Multimedia intelligence, source context and emerging threats.",
      icon: Network,
    },
    {
      name: "Cyber Investigation & Technical Operations",
      description:
        "Evidence, financial trails, e-Zero FIR referral review and multi-jurisdiction case coordination.",
      icon: Fingerprint,
    },
    {
      name: "Capacity Building, Research & Innovation Unit",
      description:
        "Annual training, awareness outreach, internships, hackathons and reviewed operational playbooks.",
      icon: BookOpen,
    },
    {
      name: "Administrative Wing",
      description:
        "Governance, manpower, logistics, procurement, data consolidation and periodic performance review.",
      icon: Users,
    },
    {
      name: "Advanced Cyber Forensic Support",
      description:
        "Digital and mobile evidence, examination requests, forensic integrity and technical expert support.",
      icon: Fingerprint,
    },
    {
      name: "Cybersecurity Response Division",
      description:
        "Infrastructure risk review, incident containment, recovery and post-incident lessons.",
      icon: ShieldCheck,
    },
  ];
  return (
    <>
      <div className="page-intro">
        <div>
          <span className="eyebrow">US4C FUNCTIONAL FRAMEWORK</span>
          <h1>Functional Units</h1>
          <p>
            Functional ownership and shared intelligence across every cyber
            mission.
          </p>
        </div>
      </div>
      <div className="units-layout">
        <div className="unit-hub">
          <Shield size={52} />
          <span className="eyebrow">UNIFIED COMMAND</span>
          <h2>US4C</h2>
          <p>
            Command review
            <br />
            Sources & data intake
            <br />
            Inter-agency coordination
          </p>
          <Tag>{cases.length} cases in workspace</Tag>
        </div>
        <div className="units-grid">
          {units.map((u, i) => (
            <Panel
              title={u.name}
              eyebrow={`FUNCTIONAL UNIT / 0${i + 1}`}
              key={u.name}
            >
              <u.icon size={25} className="cyan" />
              <p className="body-copy">{u.description}</p>
              <div className="unit-bottom">
                <span>
                  {cases.filter((c) => c.unit === u.name).length} assigned cases
                </span>
                <Tag>Shared intelligence</Tag>
              </div>
            </Panel>
          ))}
        </div>
      </div>
      <NavLink to="/fusion" className="fusion-strip">
        <Layers3 size={24} />
        <div>
          <strong>Common data fusion + AI layer</strong>
          <span>
            AI / ML · NLP · Advanced analytics · Source-aware intelligence
          </span>
        </div>
        <ArrowRight size={20} />
      </NavLink>
    </>
  );
}
function Reports({ cases }: Workspace) {
  return (
    <Suspense
      fallback={<div className="ops-empty">Loading operational reports…</div>}
    >
      <OperationsReports cases={cases} />
    </Suspense>
  );
}
function NotFound() {
  return (
    <div className="empty">
      <CircleHelp />
      <h1>Workspace not found</h1>
      <NavLink className="button" to="/">
        Back to command centre
      </NavLink>
    </div>
  );
}

function Shell() {
  const [cases, setCases] = useState<Case[]>(loadDemo);
  const [user, setUser] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [chat, setChat] = useState(false);
  const [auth, setAuth] = useState(false);
  const [launched, setLaunched] = useState(
    () => sessionStorage.getItem("us4c-portal-open-v2") === "true",
  );
  const [message, setMessage] = useState("");
  useEffect(() => {
    if (!database) return;
    let mounted = true;
    let generation = 0;
    const {
      data: { subscription },
    } = database.auth.onAuthStateChange((_event, session) => {
      const version = ++generation;
      const next = session?.user || null;
      setUser(next);
      if (next) {
        setLoading(true);
        void loadRemote(next.id)
          .then((rows) => {
            if (mounted && version === generation) {
              setCases(rows);
              setMessage("");
            }
          })
          .catch((e) => {
            if (mounted && version === generation) {
              setCases([]);
              setMessage((e as Error).message);
            }
          })
          .finally(() => {
            if (mounted && version === generation) setLoading(false);
          });
      } else {
        setCases(loadDemo());
        setLoading(false);
        void loadPublic()
          .then((rows) => {
            if (
              mounted &&
              version === generation &&
              !hasDemoCache() &&
              rows.length
            )
              setCases(rows);
          })
          .catch((e) => {
            if (mounted && version === generation)
              setMessage((e as Error).message);
          });
      }
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);
  const save = async (item: Case) => {
    setSaving(true);
    try {
      const saved = user ? await saveRemote(item, user.id) : item;
      setCases((previous) => {
        const next = previous.some((c) => c.id === saved.id)
          ? previous.map((c) => (c.id === saved.id ? saved : c))
          : [saved, ...previous];
        if (!user) saveDemo(next);
        return next;
      });
    } finally {
      setSaving(false);
    }
  };
  const props: Workspace = {
    cases,
    user,
    saving,
    save,
    openChat: () => setChat(true),
  };
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setChat(false);
        setAuth(false);
      }
    };
    window.addEventListener("keydown", listener);
    return () => window.removeEventListener("keydown", listener);
  }, []);
  if (auth || (!launched && !user))
    return (
      <div className="cyber-app">
        <Suspense
          fallback={
            <div className="ops-empty">Loading US4C access portal…</div>
          }
        >
          <PortalGate
            onEnter={() => {
              sessionStorage.setItem("us4c-portal-open-v2", "true");
              setLaunched(true);
              setAuth(false);
            }}
            onCancel={launched ? () => setAuth(false) : undefined}
          />
        </Suspense>
      </div>
    );
  return (
    <div className="cyber-app">
      <a className="skip-link" href="#main-content">
        Skip to workspace
      </a>
      <aside className="sidebar">
        <NavLink className="brand" to="/">
          <div className="brand-mark">
            <Shield size={27} />
          </div>
          <div>
            <strong>US4C</strong>
            <span>CYBER COMMAND</span>
          </div>
        </NavLink>
        <div className="sidebar-caption">OPERATIONS WORKSPACE</div>
        <nav aria-label="Workspace">
          <NavLink to="/" end>
            <LayoutDashboard size={18} />
            Command centre
          </NavLink>
          <NavLink to="/cases">
            <Layers3 size={18} />
            Case register
          </NavLink>
          <div className="sidebar-caption">MISSION DESKS</div>
          {missions.map((m) => {
            const Icon = icons[m.id];
            return (
              <NavLink to={`/mission/${m.id}`} key={m.id}>
                <Icon size={18} />
                {m.short}
              </NavLink>
            );
          })}
          <div className="sidebar-caption">SHARED INTELLIGENCE</div>
          <NavLink to="/fusion">
            <Database size={18} />
            Sources & data intake
          </NavLink>
          <NavLink to="/units">
            <Users size={18} />
            Functional units
          </NavLink>
          <NavLink to="/reports">
            <FileText size={18} />
            Outcomes & reports
          </NavLink>
        </nav>
        <div className="sidebar-bottom">
          <button onClick={() => setChat(true)} className="assistant-trigger">
            <MessageSquare size={19} />
            <div>
              <strong>Command assistant</strong>
              <span>Case and workflow assistance</span>
            </div>
            <ArrowUpRight size={15} />
          </button>
          <div className="operator">
            <div className="avatar">{user ? "OP" : "DM"}</div>
            <div>
              <strong>
                {user ? "Operator workspace" : "Training workspace"}
              </strong>
              <span>
                {user ? "Private database access" : "Operator exercise records"}
              </span>
            </div>
          </div>
        </div>
      </aside>
      <div className="app-main">
        <header className="topbar">
          <div className="breadcrumb">
            <Shield size={15} />
            <span>US4C</span>
            <ChevronRight size={13} />
            <strong>Integrated Cyber Command & Control</strong>
          </div>
          <div className="topbar-right">
            <span className="system-status">
              <i className={`dot ${database ? "cyan-dot" : ""}`} />
              {database ? "Database configured" : "Training mode"}
            </span>
            <button
              className="icon-button"
              aria-label="Open critical cases"
              onClick={() => {
                window.location.hash = "/cases";
              }}
            >
              <Bell size={18} />
              <i />
            </button>
            {user ? (
              <button
                className="button compact"
                onClick={() => {
                  sessionStorage.removeItem("us4c-portal-open-v2");
                  setLaunched(false);
                  void database?.auth.signOut();
                }}
              >
                <LogOut size={14} />
                Sign out
              </button>
            ) : (
              <button className="button compact" onClick={() => setAuth(true)}>
                <ShieldCheck size={14} />
                Operator sign in
              </button>
            )}
          </div>
        </header>
        <div className="mode-banner">
          <Fingerprint size={15} />
          <span>
            {user
              ? "Private operator workspace · database access restricted to your account"
              : "Training workspace · fictional casework with masked identifiers"}
          </span>
          <span className="mono">
            {new Date().toLocaleDateString("en-IN", {
              timeZone: "Asia/Kolkata",
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}{" "}
            / IST
          </span>
        </div>
        <main id="main-content">
          {message && (
            <div className="error" role="alert">
              {message}
            </div>
          )}
          {loading ? (
            <div className="empty">
              <Loader2 className="spin" />
              <h2>Loading private workspace…</h2>
            </div>
          ) : (
            <Routes>
              <Route path="/" element={<Dashboard {...props} />} />
              <Route
                path="/cases"
                element={
                  <>
                    <div className="page-intro">
                      <div>
                        <span className="eyebrow">
                          COMMON OPERATIONAL PICTURE
                        </span>
                        <h1>Case register</h1>
                        <p>
                          Search and review incidents across all mission areas.
                        </p>
                      </div>
                      <NavLink to="/intake" className="button primary">
                        <Plus size={16} />
                        Register incident
                      </NavLink>
                    </div>
                    <Panel
                      title="All cases"
                      eyebrow={`${cases.length} RECORDS`}
                    >
                      <Queue cases={cases} />
                    </Panel>
                  </>
                }
              />
              <Route path="/mission/:id" element={<MissionPage {...props} />} />
              <Route path="/case/:id" element={<CasePage {...props} />} />
              <Route path="/intake" element={<Intake {...props} />} />
              <Route path="/fusion" element={<Fusion {...props} />} />
              <Route path="/units" element={<Units {...props} />} />
              <Route path="/reports" element={<Reports {...props} />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          )}
        </main>
        <footer>
          <span>US4C / UNIFIED STATE CYBER COMMAND CENTRE</span>
          <span>
            Case management · Intelligence review · Agency coordination
          </span>
        </footer>
      </div>
      {chat && (
        <Suspense fallback={null}>
          <Chat close={() => setChat(false)} user={user} cases={cases} />
        </Suspense>
      )}{" "}
    </div>
  );
}
export default function CyberApp() {
  return (
    <HashRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
    >
      <Shell />
    </HashRouter>
  );
}
