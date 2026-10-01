import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
import FusionWorkflow from "./FusionWorkflow";

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
                  <span>{stages[c.stage]}</span>
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
  const active = cases.filter((c) => c.stage < 5);
  const critical = active.filter((c) => c.priority === "Critical").length;
  return (
    <>
      <div className="page-intro">
        <div>
          <span className="eyebrow">UNIFIED STATE CYBER COMMAND CENTRE</span>
          <h1>Command Centre</h1>
          <p>
            Review active incidents, mission priorities and pending operator
            actions.
          </p>
        </div>
        <NavLink to="/intake" className="button primary">
          <Plus size={16} /> Register incident
        </NavLink>
      </div>
      <div className="metrics">
        <div>
          <span>ACTIVE CASES</span>
          <strong>{active.length.toString().padStart(2, "0")}</strong>
          <p>
            <i className="dot cyan-dot" />
            Across all mission desks
          </p>
        </div>
        <div>
          <span>CRITICAL PRIORITY</span>
          <strong className="coral-text">
            {critical.toString().padStart(2, "0")}
          </strong>
          <p>Human review comes first</p>
        </div>
        <div>
          <span>FUNDS FROZEN</span>
          <strong>{money(cases.reduce((s, c) => s + c.frozen, 0))}</strong>
          <p>From recorded acknowledgements</p>
        </div>
        <div>
          <span>CASES RESOLVED</span>
          <strong>
            {cases
              .filter((c) => c.stage === 5)
              .length.toString()
              .padStart(2, "0")}
          </strong>
          <p>Outcome and follow-up recorded</p>
        </div>
      </div>
      <div className="section-label">
        <h2>Mission workspaces</h2>
        <span>FOUR OPERATIONAL MISSIONS</span>
      </div>
      <div className="mission-grid">
        {missions.map((m, i) => {
          const Icon = icons[m.id];
          const items = active.filter((c) => c.mission === m.id);
          return (
            <NavLink
              className={`mission-card ${m.id}`}
              key={m.id}
              to={`/mission/${m.id}`}
            >
              <div className="mission-top">
                <Icon size={24} />
                <span className="mono">0{i + 1} / MISSION</span>
                <ArrowUpRight size={19} />
              </div>
              <h3>{m.title}</h3>
              <p>{m.description}</p>
              <div className="mission-bottom">
                <span>
                  <strong>{items.length}</strong> active case
                  {items.length !== 1 ? "s" : ""}
                </span>
                <span>
                  {items.filter((c) => c.priority === "Critical").length}{" "}
                  critical <i className="dot" />
                </span>
              </div>
            </NavLink>
          );
        })}
      </div>
      <div className="overview-grid">
        <Panel
          title="Priority queue"
          eyebrow="OPERATOR ATTENTION"
          action={
            <NavLink className="text-link" to="/cases">
              All cases <ArrowRight size={14} />
            </NavLink>
          }
        >
          <Queue
            cases={[...active].sort(
              (a, b) =>
                Number(b.priority === "Critical") -
                Number(a.priority === "Critical"),
            )}
          />
        </Panel>
        <Panel title="Command brief" eyebrow="HUMAN + MACHINE">
          <div className="brief-symbol">
            <MessageSquare size={31} />
            <div className="orbit-ring" />
          </div>
          <h3 className="brief-title">Operator review</h3>
          <p className="brief-copy">
            Review source evidence, confirm AI findings, and record the next
            action with the responsible unit.
          </p>
          <div className="brief-check">
            <ShieldCheck size={17} />
            <span>AI insights stay separate from verified findings.</span>
          </div>
          <button className="button full" onClick={openChat}>
            <MessageSquare size={16} /> Open command assistant{" "}
            <ArrowRight size={15} />
          </button>
        </Panel>
      </div>
      <div className="fusion-strip">
        <Layers3 size={22} />
        <div>
          <strong>Shared intelligence</strong>
          <span>
            Complaints · Financial records · Open sources · Internal systems
          </span>
        </div>
        <NavLink to="/fusion" className="text-link">
          Explore data fusion <ArrowRight size={16} />
        </NavLink>
      </div>
    </>
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
      <div className="journey">
        {stages.map((s, i) => (
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
  const [tab, setTab] = useState("Overview");
  const [review, setReview] = useState(false);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [outcome, setOutcome] = useState("");
  useEffect(() => {
    setReview(false);
    setNote("");
    setOutcome("");
    setTab("Overview");
  }, [id]);
  if (!item) return <NotFound />;
  const mission = missions.find((m) => m.id === item.mission)!;
  const mutate = async (next: Case) => {
    setError("");
    try {
      await save(next);
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
          <Tag>{item.isDemo ? "Synthetic example" : "Private case"}</Tag>
        </div>
      </div>
      <div className="journey">
        {stages.map((s, i) => (
          <div
            className={
              i === item.stage ? "current" : i < item.stage ? "complete" : ""
            }
            key={s}
          >
            <span>
              {i < item.stage ? (
                <Check size={14} />
              ) : (
                String(i + 1).padStart(2, "0")
              )}
            </span>
            <strong>{s}</strong>
            {i < 5 && <ChevronRight size={16} />}
          </div>
        ))}
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
            {item.isDemo
              ? "Sample timeline · not a live SLA"
              : "SLA not configured"}
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
          "DB fusion",
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
      <div className="case-grid">
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
                  These are sample insights or recorded analyst notes. Live
                  assistant output requires independent verification.
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
          {tab === "DB fusion" && (
            <FusionWorkflow
              item={item}
              cases={cases}
              save={save}
              saving={saving}
              openChat={openChat}
            />
          )}
          {tab === "Evidence" && (
            <Panel title="Evidence register" eyebrow="SOURCE + PROVENANCE">
              <p className="body-copy">
                Evidence metadata stays with the case. Sample attachments are
                descriptions; original media has not been uploaded.
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
                Select a node to inspect its source and confidence. Connections
                below illustrate this workflow; they are not verified identity
                matches.
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
                  <label className="sr-only" htmlFor={`action-${i}`}>
                    Status for {a.agency}
                  </label>
                  <select
                    id={`action-${i}`}
                    value={a.status}
                    disabled={saving}
                    onChange={(e) => {
                      const status = e.target.value;
                      void mutate({
                        ...item,
                        actions: item.actions.map((x, j) =>
                          j === i ? { ...x, status } : x,
                        ),
                        timeline: [
                          ...item.timeline,
                          {
                            time: nowIST(),
                            text: `${a.agency}: operator recorded ${status}`,
                          },
                        ],
                      });
                    }}
                  >
                    {[
                      ...new Set([
                        a.status,
                        "Pending",
                        "Draft",
                        "Request prepared",
                        "Acknowledged",
                        "Action recorded",
                        "Completed",
                      ]),
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </div>
              ))}
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
          <Panel
            title="Next operator action"
            eyebrow={stages[item.stage].toUpperCase()}
          >
            <p className="body-copy">{playbooks[item.mission][item.stage]}</p>
            {item.stage >= 2 && item.stage < 5 && (
              <label className="review-check">
                <input
                  type="checkbox"
                  checked={review}
                  onChange={(e) => setReview(e.target.checked)}
                />
                I reviewed the evidence and applicable SOP for the next stage.
              </label>
            )}
            {item.stage === 4 && (
              <label>
                Resolution and follow-up
                <textarea
                  value={outcome}
                  onChange={(e) => setOutcome(e.target.value)}
                  required
                  maxLength={2000}
                  placeholder="Record outcome, handover and follow-up"
                />
              </label>
            )}
            {item.stage < 5 ? (
              <button
                className="button primary full"
                disabled={
                  saving ||
                  (item.stage >= 2 && !review) ||
                  (item.stage === 4 && !outcome.trim())
                }
                onClick={() => void advance()}
              >
                {saving ? (
                  <Loader2 className="spin" size={16} />
                ) : (
                  <ShieldCheck size={16} />
                )}{" "}
                Move to {stages[item.stage + 1]}
              </button>
            ) : (
              <Tag tone="success">Resolved · outcome recorded</Tag>
            )}
            {error && (
              <p role="alert" className="error">
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
  const [node, setNode] = useState(0);
  const nodes =
    item.mission === "fraud"
      ? [
          "Victim account",
          "Mule account 1",
          "Mule account 2",
          "Wallet / merchant",
        ]
      : item.mission === "content"
        ? [
            "Source account",
            "Early amplifiers",
            "Related accounts",
            "Share clusters",
          ]
        : item.mission === "distress"
          ? [
              "Reported signal",
              "Location clue",
              "Human review",
              "Response resources",
            ]
          : [
              "Reported account",
              "Email / alias",
              "Device / IP clues",
              "Related profiles",
            ];
  return (
    <>
      <div className="entity-graph">
        {nodes.map((n, i) => (
          <div key={n}>
            <button
              className={node === i ? "active" : ""}
              onClick={() => setNode(i)}
            >
              <GitBranch size={23} />
              <span>{n}</span>
              <small>
                {i === 0 ? "Reported source" : "Unverified relationship"}
              </small>
            </button>
            {i < 3 && <ArrowRight className="edge-arrow" size={25} />}
          </div>
        ))}
      </div>
      <div className="node-details">
        <Tag>Node {node + 1}</Tag>
        <h3>{nodes[node]}</h3>
        <p>
          Source: {item.evidence[0]?.source || "Not recorded"} · Confidence:{" "}
          {node === 0 ? "Reported" : "Illustrative / needs verification"}
        </p>
        <p>
          {item.mission === "fraud"
            ? "Verify account identifiers, transaction timestamps, transferred amounts and freeze acknowledgements against original bank records."
            : "Verify this relationship using original evidence and record the basis before taking action."}
        </p>
      </div>
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
        <Tag>
          {user ? "Private Supabase record" : "Local demonstration record"}
        </Tag>
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
function Fusion() {
  const [selected, setSelected] = useState("Financial records");
  const [ingestion, setIngestion] = useState("Direct data ingestion");
  const sources = [
    "Government databases",
    "Telecom",
    "RTO data",
    "Citizen records",
    "Financial records",
    "Other source records",
    "Internal systems",
    "Open sources",
  ];
  return (
    <>
      <div className="page-intro">
        <div>
          <span className="eyebrow">US4C / DATA FUSION</span>
          <h1>Data Fusion</h1>
          <p>
            A shared intelligence layer connects functional units to operational
            decisions.
          </p>
        </div>
        <Tag>Integration blueprint</Tag>
      </div>
      <div className="fusion-layout">
        <Panel title="Source systems" eyebrow="01 / INGEST">
          <div className="source-list">
            {sources.map((s, i) => (
              <button
                key={s}
                className={selected === s ? "selected" : ""}
                onClick={() => setSelected(s)}
              >
                <Database size={17} />
                <span>{s}</span>
                <small>0{i + 1}</small>
              </button>
            ))}
          </div>
        </Panel>
        <Panel title="Fusion & analysis" eyebrow="02 / UNDERSTAND">
          <div className="fusion-core">
            <Layers3 size={44} />
            <h3>Unified intelligence layer</h3>
            <p>Structured · Semi-structured · Unstructured</p>
          </div>
          <div className="analysis-grid">
            {[
              "Text & NLP",
              "Multimedia review",
              "Search & linkage",
              "Risk indicators",
              "GIS intelligence",
              "Predictive hypotheses",
            ].map((s) => (
              <div key={s}>
                <MessageSquare size={16} />
                {s}
              </div>
            ))}
          </div>
          <div className="notice">
            <ShieldCheck size={18} />
            Every conclusion retains its source, confidence and human review
            status.
          </div>
        </Panel>
        <Panel title="Operational intelligence" eyebrow="03 / ACT">
          <div className="source-list">
            {[
              "Entity search",
              "Reviewed alerts",
              "Case intelligence",
              "Coordination records",
              "Outcome reporting",
            ].map((s) => (
              <div className="output-row" key={s}>
                <Check size={16} />
                {s}
              </div>
            ))}
          </div>
          <div className="slm-block">
            <MessageSquare size={24} />
            <h3>SLM / AI assistant layer</h3>
            <p>
              Summarise, explain and draft. Operators verify and approve
              actions.
            </p>
          </div>
        </Panel>
      </div>
      <Panel
        title="Ingestion & normalization"
        eyebrow="RETAINED DATA FUSION STEPS"
      >
        <div className="ingestion-methods">
          {[
            "Direct data ingestion",
            "Web crawling",
            "Ad hoc request portal / web services",
            "One-time import + incremental updates",
            "Hardcopy scanning / OCR / translation / archiving",
          ].map((method, i) => (
            <button
              className={ingestion === method ? "selected" : ""}
              key={method}
              onClick={() => setIngestion(method)}
            >
              <span className="mono">0{i + 1}</span>
              {method}
              <ArrowRight size={14} />
            </button>
          ))}
        </div>
        <div className="ingestion-formats">
          {[
            "Text / email / voice",
            "Forms / XML / messages",
            "Photos / video / maps",
            "Identifiers / structured records",
          ].map((format) => (
            <span className="tag" key={format}>
              {format}
            </span>
          ))}
        </div>
        <p className="body-copy">
          {ingestion} includes source validation, record normalization, entity
          resolution, analytics and operator review.
        </p>
      </Panel>
      <Panel title={selected} eyebrow="SELECTED SOURCE">
        <p className="body-copy">
          This source is part of the integration blueprint. No external{" "}
          {selected.toLowerCase()} feed is connected. Current operational
          persistence uses Supabase; government, bank and telecom connections
          require authorised connectors and source agreements.
        </p>
        <div className="source-meta">
          <div>
            <span>INGESTION</span>
            <strong>
              {selected === "Open sources"
                ? "URL / archived content"
                : "Direct API / reviewed import"}
            </strong>
          </div>
          <div>
            <span>REVIEW</span>
            <strong>Provenance + confidence</strong>
          </div>
          <div>
            <span>STATUS</span>
            <strong>Connector not configured</strong>
          </div>
        </div>
      </Panel>
    </>
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
            Data fusion
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
  const [exported, setExported] = useState(false);
  return (
    <>
      <div className="page-intro">
        <div>
          <span className="eyebrow">OUTCOMES & ACCOUNTABILITY</span>
          <h1>Operational Reports</h1>
          <p>Measure progress from the records in this workspace.</p>
        </div>
        <button
          className="button"
          onClick={() => {
            const blob = new Blob([JSON.stringify(cases, null, 2)], {
              type: "application/json",
            });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "us4c-workspace-report.json";
            a.click();
            URL.revokeObjectURL(a.href);
            setExported(true);
          }}
        >
          <Download size={16} />
          {exported ? "Exported" : "Export report"}
        </button>
      </div>
      <Panel title="Mission performance" eyebrow="RECORDED DATA">
        <div className="report-table">
          <table>
            <thead>
              <tr>
                <th>Mission</th>
                <th>Cases</th>
                <th>Critical active</th>
                <th>Resolved</th>
                <th>Completed actions</th>
              </tr>
            </thead>
            <tbody>
              {missions.map((m) => {
                const list = cases.filter((c) => c.mission === m.id);
                return (
                  <tr key={m.id}>
                    <td>{m.title}</td>
                    <td>{list.length}</td>
                    <td>
                      {
                        list.filter(
                          (c) => c.priority === "Critical" && c.stage < 5,
                        ).length
                      }
                    </td>
                    <td>{list.filter((c) => c.stage === 5).length}</td>
                    <td>
                      {
                        list
                          .flatMap((c) => c.actions)
                          .filter((a) => a.status === "Completed").length
                      }
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Panel>
      <div className="overview-grid">
        <Panel title="Financial response" eyebrow="RECORDED ACKNOWLEDGEMENTS">
          <div className="report-money">
            <span>Reported amount</span>
            <strong>{money(cases.reduce((s, c) => s + c.amount, 0))}</strong>
            <span>Frozen amount</span>
            <strong className="cyan">
              {money(cases.reduce((s, c) => s + c.frozen, 0))}
            </strong>
          </div>
        </Panel>
        <Panel title="Outcome register" eyebrow="FOLLOW-UP & HANDOVER">
          {cases.filter((c) => c.stage === 5).length ? (
            cases
              .filter((c) => c.stage === 5)
              .map((c) => (
                <NavLink className="case-row" to={`/case/${c.id}`} key={c.id}>
                  <div>
                    <h3>{c.title}</h3>
                    <p>{c.outcome}</p>
                  </div>
                  <ArrowRight size={16} />
                </NavLink>
              ))
          ) : (
            <div className="empty">
              <ShieldCheck />
              <h3>No resolved cases yet</h3>
              <p>
                Resolved cases appear here with their recorded outcome and
                follow-up.
              </p>
            </div>
          )}
        </Panel>
      </div>
    </>
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

function Chat({
  close,
  user,
  cases,
}: {
  close: () => void;
  user: User | null;
  cases: Case[];
}) {
  const [messages, setMessages] = useState<
    { role: "user" | "assistant"; content: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const ask = async (question: string) => {
    if (!question.trim() || busy) return;
    const next = [
      ...messages,
      { role: "user" as const, content: question.trim() },
    ];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError("");
    try {
      const endpoint = import.meta.env.VITE_CHATBOT_URL;
      if (!endpoint)
        throw new Error(
          "The command assistant endpoint has not been configured.",
        );
      let token: string | undefined;
      if (user && database) {
        const { data } = await database.auth.getSession();
        token = data.session?.access_token;
      }
      const response = await fetch(`${endpoint.replace(/\/$/, "")}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          messages: next.slice(-10),
          caseId: window.location.hash.startsWith("#/case/")
            ? decodeURIComponent(window.location.hash.slice(7))
            : undefined,
        }),
        signal: AbortSignal.timeout(35000),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Assistant unavailable. Try again.");
      setMessages([...next, { role: "assistant", content: result.reply }]);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="chat-backdrop" onClick={close}>
      <section
        className="chat-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Command assistant"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="chat-header">
          <div className="case-icon">
            <MessageSquare size={24} />
          </div>
          <div>
            <h2>Command assistant</h2>
            <span>OPERATOR SUPPORT</span>
          </div>
          <button
            className="icon-button"
            aria-label="Close assistant"
            onClick={close}
          >
            <X size={21} />
          </button>
        </div>
        <div className="chat-body">
          <div className="notice">
            <ShieldCheck size={17} />
            AI drafts require human review.{" "}
            {user
              ? "Uses only cases accessible to your account."
              : "Public mode uses synthetic examples only."}
          </div>
          {!messages.length && (
            <div className="chat-welcome">
              <MessageSquare size={39} />
              <h3>Command Assistant</h3>
              <p>
                Explore a mission, prepare a coordination draft or review what
                to verify next.
              </p>
              {[
                "Explain the financial fraud response workflow",
                "What should I verify in a distress referral?",
                "Draft an evidence-preservation checklist",
              ].map((q) => (
                <button key={q} onClick={() => void ask(q)}>
                  {q}
                  <ArrowUpRight size={15} />
                </button>
              ))}
              <small>{cases.length} cases in current workspace</small>
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} className={`message ${m.role}`}>
              <span>{m.role === "user" ? "YOU" : "COMMAND ASSISTANT"}</span>
              <div className="markdown">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {m.content}
                </ReactMarkdown>
              </div>
            </div>
          ))}
          {busy && (
            <div className="chat-loading" role="status">
              <Loader2 size={16} className="spin" />
              Preparing a response…
            </div>
          )}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
        </div>
        <form
          className="chat-composer"
          onSubmit={(e) => {
            e.preventDefault();
            void ask(input);
          }}
        >
          <textarea
            aria-label="Message command assistant"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about a case or mission…"
            maxLength={3000}
            rows={2}
          />
          <button
            className="button primary"
            aria-label="Send message"
            disabled={busy || !input.trim()}
          >
            <Send size={18} />
          </button>
          <small>
            10 requests / minute per operator or public demo visitor · bounded
            output
          </small>
        </form>
      </section>
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
  const [message, setMessage] = useState("");
  const [authError, setAuthError] = useState("");
  const [authBusy, setAuthBusy] = useState(false);
  const [mode, setMode] = useState<"signin" | "signup">("signin");
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
  return (
    <div className="cyber-app">
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
            Data fusion
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
                {user ? "Operator workspace" : "Demonstration workspace"}
              </strong>
              <span>
                {user ? "Private database access" : "Synthetic example records"}
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
              {database ? "Database configured" : "Demo mode"}
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
                onClick={() => void database?.auth.signOut()}
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
              : "Sample data workspace · synthetic demonstration records"}
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
        <main>
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
              <Route path="/fusion" element={<Fusion />} />
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
      {chat && <Chat close={() => setChat(false)} user={user} cases={cases} />}{" "}
      {auth && (
        <div className="modal-backdrop" onClick={() => setAuth(false)}>
          <section
            className="auth-modal panel"
            role="dialog"
            aria-modal="true"
            aria-label="Operator authentication"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="icon-button modal-close"
              aria-label="Close sign in"
              onClick={() => setAuth(false)}
            >
              <X size={20} />
            </button>
            <ShieldCheck size={31} className="cyan" />
            <span className="eyebrow">PRIVATE OPERATOR WORKSPACE</span>
            <h2>
              {mode === "signin"
                ? "Operator sign in"
                : "Create operator account"}
            </h2>
            <p>
              Authenticated cases are stored privately in Supabase. Public
              demonstration records stay separate.
            </p>
            {!database ? (
              <p className="error">
                Supabase connection has not been configured.
              </p>
            ) : (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setAuthBusy(true);
                  setAuthError("");
                  const f = new FormData(e.currentTarget);
                  try {
                    const credentials = {
                      email: String(f.get("email")),
                      password: String(f.get("password")),
                    };
                    const { data, error } =
                      mode === "signin"
                        ? await database.auth.signInWithPassword(credentials)
                        : await database.auth.signUp(credentials);
                    if (error) throw error;
                    if (data.session) setAuth(false);
                    else
                      setAuthError(
                        "Check your email to confirm the account, then sign in.",
                      );
                  } catch (err) {
                    setAuthError((err as Error).message);
                  } finally {
                    setAuthBusy(false);
                  }
                }}
              >
                <label>
                  Email
                  <input
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                  />
                </label>
                <label>
                  Password
                  <input
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete={
                      mode === "signin" ? "current-password" : "new-password"
                    }
                  />
                </label>
                <button className="button primary full" disabled={authBusy}>
                  {authBusy ? (
                    <Loader2 size={16} className="spin" />
                  ) : (
                    <ShieldCheck size={16} />
                  )}{" "}
                  {mode === "signin" ? "Sign in" : "Create account"}
                </button>
              </form>
            )}
            {authError && (
              <p role="status" className="notice">
                {authError}
              </p>
            )}
            <button
              className="text-link"
              onClick={() => {
                setMode(mode === "signin" ? "signup" : "signin");
                setAuthError("");
              }}
            >
              {mode === "signin"
                ? "Create an operator account"
                : "Already have an account? Sign in"}
              <ArrowRight size={14} />
            </button>
          </section>
        </div>
      )}
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

