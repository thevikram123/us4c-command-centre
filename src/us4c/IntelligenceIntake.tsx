import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ArrowRight,
  Check,
  Database,
  FileText,
  Headphones,
  Mail,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { type Case, type Mission, missions, nowIST } from "./data";
import { initialInvestigation } from "./investigation";
type FeedRecord = {
  id: string;
  channel: string;
  source: string;
  author: string;
  time: string;
  location: string;
  title: string;
  text: string;
  mission: Mission;
  priority: Case["priority"];
  identifiers: string[];
  attachments: string[];
  reference: string;
  metrics?: string;
  transcript?: { speaker: string; text: string }[];
};
const feedRecords: FeedRecord[] = [
  {
    id: "SOC-071",
    channel: "Social media",
    source: "Public-post archive",
    author: "@cityupdates.local",
    time: "10:21 IST",
    location: "Varanasi",
    title: "Video repost with disputed location",
    text: "“This happened near the east market this morning.” The attached 01:42 video repeats frames from an earlier upload. Three reposts use the same caption; the recording date and location need analyst verification.",
    mission: "content",
    priority: "High",
    identifiers: ["cityupdates.local", "VID/0930/16", "SHA-REF/7D41"],
    attachments: [
      "Caption capture",
      "Key-frame sheet",
      "Archived post reference",
    ],
    reference: "OSINT/1001/071",
    metrics: "3 reposts in imported archive · 01:42 video",
  },
  {
    id: "HEL-028",
    channel: "1930 helpline",
    source: "Helpline intake",
    author: "Call reference 1930/1001/028",
    time: "10:18 IST",
    location: "Jaipur",
    title: "Courier clearance call followed by two debits",
    text: "Caller reports a remote-access installation request and two payments totalling ₹18,750. Payment screenshots were submitted during the call. The second beneficiary identifier remains unreadable and requires clarification.",
    mission: "fraud",
    priority: "Critical",
    identifiers: ["parcelassist.pay@upi", "₹18,750", "UTR/1038/A"],
    attachments: ["Call transcript", "Two payment receipts"],
    reference: "1930/1001/028",
    transcript: [
      {
        speaker: "Operator",
        text: "What time did the two payments leave your account?",
      },
      {
        speaker: "Complainant",
        text: "The first was at 9:12 and the second at 9:16. The caller said the parcel would otherwise be returned.",
      },
      {
        speaker: "Operator",
        text: "Keep the receipts and the caller messages. We will register both transactions for review.",
      },
    ],
  },
  {
    id: "SOC-072",
    channel: "Social media",
    source: "Citizen-reported account archive",
    author: "@northlane.support",
    time: "10:15 IST",
    location: "Kanpur",
    title: "Repeated contact and residential-area reference",
    text: "An account using the complainant’s photograph sent repeated messages after being blocked. The last message references the residential area. The reporter requests contact only through the assigned protection officer.",
    mission: "safety",
    priority: "Critical",
    identifiers: ["northlane.support", "northlane.help", "V-1041"],
    attachments: ["18-message capture", "Profile URL archive"],
    reference: "PROT/1001/072",
    metrics: "2 accounts · 18 preserved messages",
  },
  {
    id: "FIN-014",
    channel: "Financial response",
    source: "Nodal response register",
    author: "Beneficiary institution · nodal desk",
    time: "10:14 IST",
    location: "Lucknow",
    title: "Hold acknowledgement received · ₹38,500",
    text: "Acknowledgement ACK/FI/1042/02 records ₹38,500 on hold against the beneficiary account ending 4821. Two onward transfers require reconciliation. The response names Aarav Enterprises Services; the receipt uses Aarav Enterprises.",
    mission: "fraud",
    priority: "High",
    identifiers: ["ACK/FI/1042/02", "••4821", "aarav.pay@upi"],
    attachments: ["Nodal acknowledgement", "Transaction extract"],
    reference: "FI/1001/014",
  },
  {
    id: "CIT-119",
    channel: "Citizen portal",
    source: "Citizen complaint register",
    author: "Protected complainant · C-119",
    time: "10:11 IST",
    location: "Bhopal",
    title: "Impersonation account contacting family members",
    text: "The complainant reports that an account using their name and profile image is requesting payments from relatives. Three conversation captures and the profile reference are available. No debit has been reported by the complainant.",
    mission: "safety",
    priority: "High",
    identifiers: ["PROF/C119/01", "3 conversation captures"],
    attachments: ["Profile capture", "Message archive"],
    reference: "CIT/1001/119",
  },
  {
    id: "EMR-039",
    channel: "Emergency referral",
    source: "Welfare coordination register",
    author: "Family referral · R-1039",
    time: "09:48 IST",
    location: "Prayagraj",
    title: "Immediate welfare concern · last-known landmark",
    text: "A family member reports a concerning message at 09:41. Last-known location is the riverfront access road near Sector 4. Phone contact and location remain unconfirmed. A supervisor review and urgent contact attempt are required.",
    mission: "distress",
    priority: "Critical",
    identifiers: ["R-1039", "Sector 4 riverfront", "09:41 IST"],
    attachments: ["Referral statement", "Landmark note"],
    reference: "WEL/1001/039",
  },
  {
    id: "INT-046",
    channel: "Internal referral",
    source: "Threat intelligence desk",
    author: "Analyst referral · INT-046",
    time: "09:37 IST",
    location: "Indore",
    title: "Evacuation notice circulating without original date",
    text: "An archived notice from an earlier event is being reposted with its date cropped out. Preserve the original notice and current repost. Request jurisdiction confirmation before preparing a context clarification.",
    mission: "content",
    priority: "High",
    identifiers: ["NOTICE/0918/04", "ADV/1036/02"],
    attachments: ["Original notice", "Cropped repost"],
    reference: "INT/1001/046",
  },
  {
    id: "TEL-018",
    channel: "Telecom record",
    source: "Authorised response import",
    author: "Telecom liaison register",
    time: "09:29 IST",
    location: "Lucknow",
    title: "Subscriber response · caller-number enquiry",
    text: "A documented response to enquiry TEL/1042/01 has been entered for the caller identifier ending 1904. Review the request reference, observation period and authorised scope before attaching subscriber details to the canonical profile.",
    mission: "fraud",
    priority: "Medium",
    identifiers: ["TEL/1042/01", "••1904", "01 Oct 09:00–10:00"],
    attachments: ["Response metadata", "Request reference"],
    reference: "TEL/1001/018",
  },
];
const connectors = [
  {
    name: "Citizen portal & 1930",
    kind: "Complaint / voice transcript",
    mode: "Case import",
    icon: Headphones,
  },
  {
    name: "Social media & open sources",
    kind: "Posts / URLs / archived media",
    mode: "Archive import",
    icon: MessageSquare,
  },
  {
    name: "Financial institutions",
    kind: "UTR / account / hold response",
    mode: "Documented response",
    icon: Wallet,
  },
  {
    name: "Telecom & device records",
    kind: "Subscriber / device / time window",
    mode: "Authorised import",
    icon: Database,
  },
  {
    name: "Government databases",
    kind: "CCTNS / NCRB / ICJS / e-Courts",
    mode: "Reference import",
    icon: ShieldCheck,
  },
  {
    name: "Email & hardcopy",
    kind: "Messages / OCR / translated documents",
    mode: "Manual extraction",
    icon: Mail,
  },
  {
    name: "Transport registries",
    kind: "VAHAN / SARATHI / RTO references",
    mode: "Authorised reference import",
    icon: Database,
  },
  {
    name: "Internal case register",
    kind: "Case references / prior enquiries / watchlists",
    mode: "Workspace record linkage",
    icon: FileText,
  },
];
export default function IntelligenceIntake({
  cases,
  save,
  saving,
  user,
}: {
  cases: Case[];
  save: (item: Case) => Promise<void>;
  saving: boolean;
  user: { id: string } | null;
}) {
  const [channel, setChannel] = useState("All sources");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("SOC-071");
  const [view, setView] = useState("feed");
  const [error, setError] = useState("");
  const [note, setNote] = useState("");
  const [linked, setLinked] = useState("");
  const [tab, setTab] = useState("source");
  const records = useMemo(
    () =>
      user
        ? cases.flatMap((c) =>
            c.evidence.map(
              (e, i): FeedRecord => ({
                id: `${c.id}-E${i}`,
                channel: e.type,
                source: e.source,
                author: c.unit,
                time: e.time,
                location: c.location,
                title: e.name,
                text: c.summary,
                mission: c.mission,
                priority: c.priority,
                identifiers: c.entities.map((x) => x.value),
                attachments: [e.name],
                reference: `${c.id}/E-${i + 1}`,
              }),
            ),
          )
        : feedRecords,
    [user, cases],
  );
  const channels = ["All sources", ...new Set(records.map((r) => r.channel))];
  const list = records.filter(
    (r) =>
      (channel === "All sources" || r.channel === channel) &&
      JSON.stringify(r).toLowerCase().includes(query.toLowerCase()),
  );
  const item = records.find((r) => r.id === selected) || list[0];
  const created = cases.find((c) => c.source === item?.reference);
  const [linkTarget, setLinkTarget] = useState("");
  async function createIncident() {
    if (!item) return;
    setError("");
    const mission = missions.find((m) => m.id === item.mission)!;
    const id = `US4C-INT-${item.id}`;
    const next: Case = {
      id,
      title: item.title,
      mission: item.mission,
      priority: item.priority,
      stage: 0,
      location: item.location,
      source: item.reference,
      unit: mission.unit,
      createdAt: new Date().toISOString(),
      amount: 0,
      frozen: 0,
      summary: item.text,
      insights: [],
      entities: item.identifiers.map((value, i) => ({
        label: `Extracted identifier ${i + 1}`,
        value,
        confidence: "Operator review pending",
      })),
      evidence: item.attachments.map((name, i) => ({
        name,
        type: item.channel,
        status: "Preserved",
        source: item.reference,
        time: item.time,
      })),
      actions: [
        {
          agency: mission.unit,
          task: "Review source record and assign case officer",
          status: "Pending",
        },
      ],
      timeline: [
        {
          time: nowIST(),
          text: `Source ${item.reference} triaged to ${mission.short}${note ? `: ${note}` : ""}`,
        },
      ],
      outcome: "Intake registered; investigator review pending.",
      isDemo: !user,
    };
    next.investigation = {
      ...initialInvestigation(next),
      records: [],
      audit: [
        {
          id: crypto.randomUUID(),
          at: new Date().toISOString(),
          actor: user ? "Signed-in operator" : "Training operator",
          action: "Source intake registered",
          detail: `${item.reference} / ${note || "Incident creation from source review"}`,
          stage: "Intake",
        },
      ],
    };
    try {
      await save(next);
      setLinked(id);
    } catch (e) {
      setError((e as Error).message);
    }
  }
  return (
    <>
      <div className="page-intro">
        <div>
          <span className="eyebrow">US4C / SHARED INTELLIGENCE</span>
          <h1>Sources & data intake</h1>
          <p>
            Source review, complaint triage, evidence extraction and case
            linkage.
          </p>
        </div>
        <div className="report-tabs">
          <button
            className={view === "feed" ? "selected" : ""}
            onClick={() => setView("feed")}
          >
            Intake queue
          </button>
          <button
            className={view === "sources" ? "selected" : ""}
            onClick={() => setView("sources")}
          >
            Source systems
          </button>
        </div>
      </div>
      {view === "sources" ? (
        <>
          <div className="connector-grid">
            {connectors.map((c) => {
              const Icon = c.icon;
              return (
                <section key={c.name}>
                  <Icon size={24} />
                  <h3>{c.name}</h3>
                  <p>{c.kind}</p>
                  <div>
                    <span className="status-chip">{c.mode}</span>
                    <span className="connector-status">API not connected</span>
                  </div>
                  <button
                    className="text-link"
                    onClick={() => {
                      setView("feed");
                      setChannel("All sources");
                    }}
                  >
                    Review imported records
                    <ArrowRight size={15} />
                  </button>
                </section>
              );
            })}
          </div>
          <section className="pipeline-panel">
            <span className="eyebrow">SOURCE PROCESSING</span>
            <h2>Ingestion, fusion & provenance</h2>
            <div className="pipeline-stages">
              {[
                "Direct / API import",
                "Web archive / OCR / translation",
                "Normalize identifiers",
                "Entity resolution",
                "De-duplication",
                "Canonical profile",
                "Reviewed intelligence",
              ].map((step, i) => (
                <div key={step}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <strong>{step}</strong>
                </div>
              ))}
            </div>
            <p>
              Preserve the original source and request reference. Compare
              normalized identifiers, resolve conflicting fields, retain source
              provenance, and publish only a reviewed canonical profile.
            </p>
            <NavLink className="button" to="/cases">
              Open case fusion workspace
              <ArrowRight size={16} />
            </NavLink>
          </section>
        </>
      ) : (
        <>
          <div className="intake-source-tabs">
            {channels.map((c) => (
              <button
                key={c}
                className={channel === c ? "selected" : ""}
                onClick={() => {
                  setChannel(c);
                  const next = records.find(
                    (r) => c === "All sources" || r.channel === c,
                  );
                  if (next) setSelected(next.id);
                  setTab("source");
                }}
              >
                {c}
                <span>
                  {c === "All sources"
                    ? records.length
                    : records.filter((r) => r.channel === c).length}
                </span>
              </button>
            ))}
          </div>
          <div className="intake-layout">
            <section className="feed-queue">
              <div className="feed-queue-header">
                <label className="register-search">
                  <Search size={16} />
                  <input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label="Search intake records"
                    placeholder="Search source, identifier or location…"
                  />
                </label>
                <span>{list.length} source records</span>
              </div>
              {list.map((r) => (
                <button
                  className={`feed-item ${item?.id === r.id ? "selected" : ""}`}
                  key={r.id}
                  onClick={() => {
                    setSelected(r.id);
                    setNote("");
                    setLinked("");
                    setTab("source");
                    requestAnimationFrame(() => {
                      if (innerWidth <= 800)
                        document
                          .querySelector(".source-inspector")
                          ?.scrollIntoView({
                            behavior: matchMedia(
                              "(prefers-reduced-motion: reduce)",
                            ).matches
                              ? "auto"
                              : "smooth",
                          });
                    });
                  }}
                >
                  <div className="feed-meta">
                    <span className={`feed-channel ${r.mission}`}>
                      {r.channel}
                    </span>
                    <time>{r.time}</time>
                    <span
                      className={`status-chip ${r.priority === "Critical" ? "critical" : ""}`}
                    >
                      {r.priority}
                    </span>
                  </div>
                  <div className="feed-author">
                    <div className={`feed-avatar ${r.mission}`}>
                      {r.channel === "Social media" ? (
                        <MessageSquare size={18} />
                      ) : r.channel === "1930 helpline" ? (
                        <Headphones size={18} />
                      ) : (
                        <FileText size={18} />
                      )}
                    </div>
                    <div>
                      <strong>{r.author}</strong>
                      <span>
                        {r.source} · {r.location}
                      </span>
                    </div>
                  </div>
                  <h3>{r.title}</h3>
                  <p>{r.text}</p>
                  <div className="feed-identifiers">
                    {r.identifiers.slice(0, 3).map((id) => (
                      <code key={id}>{id}</code>
                    ))}
                  </div>
                  <footer>
                    <span>
                      {r.metrics ||
                        `${r.attachments.length} evidence references`}
                    </span>
                    <span>
                      Inspect source
                      <ArrowRight size={13} />
                    </span>
                  </footer>
                </button>
              ))}
              {!list.length ? (
                <div className="ops-empty">
                  <Database size={27} />
                  <h3>No source records in this view</h3>
                  <p>
                    Register evidence in a case or adjust the source filters.
                  </p>
                  <NavLink to="/intake" className="button">
                    Register source intake
                  </NavLink>
                </div>
              ) : null}
            </section>
            {item ? (
              <aside className="source-inspector">
                <header>
                  <span className="eyebrow">SOURCE INSPECTOR</span>
                  <h2>{item.reference}</h2>
                  <p>{item.source} · imported record</p>
                </header>
                <div className="report-tabs">
                  <button
                    className={tab === "source" ? "selected" : ""}
                    onClick={() => setTab("source")}
                  >
                    Source record
                  </button>
                  <button
                    className={tab === "extract" ? "selected" : ""}
                    onClick={() => setTab("extract")}
                  >
                    Extraction
                  </button>
                  <button
                    className={tab === "triage" ? "selected" : ""}
                    onClick={() => setTab("triage")}
                  >
                    Triage
                  </button>
                </div>
                {tab === "source" ? (
                  <div className="inspector-body">
                    <h3>{item.title}</h3>
                    <p className="source-excerpt">{item.text}</p>
                    {item.transcript ? (
                      <div className="call-transcript">
                        <h4>Call transcript</h4>
                        {item.transcript.map((t, i) => (
                          <div key={i}>
                            <span>{t.speaker}</span>
                            <p>{t.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <h4>Preserved material</h4>
                    {item.attachments.map((a, i) => (
                      <div className="source-attachment" key={a}>
                        <FileText size={17} />
                        <div>
                          <strong>{a}</strong>
                          <span>
                            {item.reference}/E-{i + 1}
                          </span>
                        </div>
                        <Check size={14} />
                      </div>
                    ))}
                    <div className="source-provenance">
                      <span>Observed</span>
                      <strong>{item.time}</strong>
                      <span>Locality</span>
                      <strong>{item.location}</strong>
                      <span>Review status</span>
                      <strong>Awaiting operator triage</strong>
                    </div>
                  </div>
                ) : null}
                {tab === "extract" ? (
                  <div className="inspector-body">
                    <h3>Extracted identifiers</h3>
                    <p>
                      Confirm each value against the preserved source before
                      entity resolution.
                    </p>
                    {item.identifiers.map((value, i) => (
                      <div className="extracted-identifier" key={value}>
                        <span>Identifier {i + 1}</span>
                        <code>{value}</code>
                        <small>
                          Source: {item.reference} · review required
                        </small>
                      </div>
                    ))}
                    <h4>Suggested routing</h4>
                    <p>{missions.find((m) => m.id === item.mission)?.title}</p>
                    <span
                      className={`status-chip ${item.priority === "Critical" ? "critical" : ""}`}
                    >
                      {item.priority} priority
                    </span>
                  </div>
                ) : null}
                {tab === "triage" ? (
                  <div className="inspector-body">
                    <h3>Operator triage</h3>
                    <label className="ops-label">
                      Triage note
                      <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        maxLength={1000}
                        placeholder="Record the source review, urgency and routing decision…"
                      />
                    </label>
                    <button
                      className="button primary full"
                      disabled={saving || !!created || !!linked || !note.trim()}
                      onClick={() => void createIncident()}
                    >
                      <Plus size={16} />
                      {created || linked
                        ? "Incident registered"
                        : "Create incident from source"}
                    </button>
                    {created || linked ? (
                      <NavLink
                        to={`/case/${created?.id || linked}`}
                        className="button full"
                      >
                        Open incident file
                        <ArrowRight size={15} />
                      </NavLink>
                    ) : null}
                    <div className="link-case-form">
                      <label className="ops-label">
                        Link to an existing incident
                        <select
                          value={linkTarget}
                          onChange={(e) => setLinkTarget(e.target.value)}
                        >
                          <option value="">Select case…</option>
                          {cases.map((c) => (
                            <option value={c.id} key={c.id}>
                              {c.id} · {c.title}
                            </option>
                          ))}
                        </select>
                      </label>
                      <button
                        className="button full"
                        disabled={
                          saving ||
                          !linkTarget ||
                          !note.trim() ||
                          !!linked ||
                          cases
                            .find((c) => c.id === linkTarget)
                            ?.evidence.some((e) => e.source === item.reference)
                        }
                        onClick={async () => {
                          const target = cases.find((c) => c.id === linkTarget);
                          if (!target) return;
                          setError("");
                          try {
                            const inv =
                              target.investigation ||
                              initialInvestigation(target);
                            await save({
                              ...target,
                              evidence: [
                                ...target.evidence,
                                {
                                  name: item.title,
                                  type: item.channel,
                                  status: "Preserved",
                                  source: item.reference,
                                  time: item.time,
                                },
                              ],
                              timeline: [
                                ...target.timeline,
                                {
                                  time: nowIST(),
                                  text: `Source linked: ${item.reference}; ${note}`,
                                },
                              ],
                              investigation: {
                                ...inv,
                                audit: [
                                  ...inv.audit,
                                  {
                                    id: crypto.randomUUID(),
                                    at: new Date().toISOString(),
                                    actor: user
                                      ? "Signed-in operator"
                                      : "Training operator",
                                    action: "Source linked to case",
                                    detail: `${item.reference}: ${note}`,
                                    stage: inv.step.toString(),
                                  },
                                ],
                              },
                            });
                            setLinked(target.id);
                          } catch (e) {
                            setError((e as Error).message);
                          }
                        }}
                      >
                        Link source to incident
                      </button>
                    </div>
                    <p className="source-action-note">
                      Creating or linking a record preserves the source
                      reference and records the operator decision.
                    </p>
                    {error ? (
                      <p className="error" role="alert">
                        {error}
                      </p>
                    ) : null}
                  </div>
                ) : null}
                <footer>
                  <ShieldCheck size={16} />
                  <span>Preserve → extract → verify → triage</span>
                </footer>
              </aside>
            ) : null}
          </div>
        </>
      )}
    </>
  );
}
