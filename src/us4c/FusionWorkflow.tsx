import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Database,
  Download,
  FileText,
  GitBranch,
  LockKeyhole,
  MapPin,
  Plus,
  Search,
  ShieldCheck,
  Split,
  Users,
} from "lucide-react";
import type { Case } from "./data";
import { database } from "./store";
import type { AuditEvent } from "./investigation";
import { money, nowIST } from "./data";
import {
  canonicalProfile,
  clusterRecords,
  domainChecks,
  flowSteps,
  gateReason,
  initialInvestigation,
  type Investigation,
  type SourceRecord,
} from "./investigation";

type Props = {
  item: Case;
  cases: Case[];
  save: (item: Case) => Promise<void>;
  saving: boolean;
  openChat: () => void;
};
type WorkspaceContext = {
  item: Case;
  state: Investigation;
  saving: boolean;
  commit: (
    patch: Partial<Investigation>,
    action: string,
    detail: string,
    casePatch?: Partial<Case>,
  ) => Promise<boolean>;
};
const InvestigationContext = createContext<WorkspaceContext | null>(null);
function useInvestigation() {
  const value = useContext(InvestigationContext);
  if (!value) throw new Error("Investigation provider missing");
  return value;
}
function Section({
  title,
  subtitle,
  children,
  action,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <section className="ops-section">
      <header>
        <div>
          <h3>{title}</h3>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {action}
      </header>
      {children}
    </section>
  );
}
function CheckAction({ id, children }: { id: string; children: ReactNode }) {
  const { state, commit, saving } = useInvestigation();
  return (
    <label className="ops-check">
      <input
        type="checkbox"
        checked={!!state.checks[id]}
        disabled={saving}
        onChange={(e) =>
          void commit(
            { checks: { ...state.checks, [id]: e.target.checked } },
            e.target.checked ? "Review confirmed" : "Review reopened",
            String(children),
          )
        }
      />
      <span>{children}</span>
      <ShieldCheck size={16} />
    </label>
  );
}
function RecordTable({
  records,
  selection,
}: {
  records: SourceRecord[];
  selection?: "query" | "canonical";
}) {
  const { state, commit, saving } = useInvestigation();
  return (
    <div className="ops-table-scroll">
      <table className="ops-table">
        <thead>
          <tr>
            <th>{selection ? "Select" : "Record"}</th>
            <th>Identity & identifier</th>
            <th>Source / reference</th>
            <th>Record quality</th>
            <th>Record detail</th>
          </tr>
        </thead>
        <tbody>
          {records.map((r) => (
            <tr
              key={r.id}
              className={state.canonicalId === r.id ? "canonical-row" : ""}
            >
              <td>
                {selection === "query" ? (
                  <input
                    aria-label={`Select ${r.id}`}
                    type="checkbox"
                    disabled={saving}
                    checked={state.selected.includes(r.id)}
                    onChange={(e) =>
                      void commit(
                        {
                          selected: e.target.checked
                            ? [...state.selected, r.id]
                            : state.selected.filter((id) => id !== r.id),
                          accepted: [],
                          locked: false,
                          published: false,
                        },
                        "Candidate selection changed",
                        r.id,
                      )
                    }
                  />
                ) : selection === "canonical" ? (
                  <input
                    aria-label={`Canonical ${r.id}`}
                    type="radio"
                    name="canonical"
                    disabled={
                      saving || state.locked || state.excluded.includes(r.id)
                    }
                    checked={state.canonicalId === r.id}
                    onChange={() =>
                      void commit(
                        { canonicalId: r.id },
                        "Canonical source selected",
                        `${r.id}: ${r.source}`,
                      )
                    }
                  />
                ) : (
                  r.id
                )}
              </td>
              <td>
                <strong>{r.name}</strong>
                <code>{r.identifier || "Identifier not recorded"}</code>
                <small>
                  {r.kind} · {r.locality}
                </small>
              </td>
              <td>
                <strong>{r.source}</strong>
                <small>{r.reference}</small>
                <small>{r.observed.replace("T", " · ")} IST</small>
              </td>
              <td>
                <span className="quality-score">{r.quality}/100</span>
                <div className="mini-bar">
                  <i style={{ width: `${r.quality}%` }} />
                </div>
              </td>
              <td className="record-detail">{r.detail}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {!records.length ? (
        <div className="ops-empty">
          <Database size={28} />
          <h3>No source records</h3>
          <p>Import documented records or add a source reference to begin.</p>
        </div>
      ) : null}
    </div>
  );
}

function IntakeStage() {
  const { item } = useInvestigation();
  return (
    <>
      <Section
        title="Intake record"
        subtitle="Review the complaint, identifiers and supporting material before fusion."
      >
        <p className="ops-context">{item.summary}</p>
        <div className="ops-field-grid">
          {item.entities.map((e) => (
            <div key={e.label}>
              <span>{e.label}</span>
              <strong>{e.value}</strong>
              <small>{e.confidence}</small>
            </div>
          ))}
        </div>
      </Section>
      <Section
        title="Evidence received"
        subtitle="Source references remain attached throughout the investigation."
      >
        {item.evidence.map((e, i) => (
          <div className="ops-evidence-line" key={e.name}>
            <FileText size={20} />
            <div>
              <strong>
                E-{String(i + 1).padStart(2, "0")} · {e.name}
              </strong>
              <p>
                {e.source} · {e.type} · {e.time}
              </p>
            </div>
            <span className="status-chip">{e.status}</span>
          </div>
        ))}
        <CheckAction id="intake">
          Intake details and evidence references reviewed
        </CheckAction>
      </Section>
    </>
  );
}

function FusionQueryStage() {
  const { state, commit, saving } = useInvestigation();
  const [query, setQuery] = useState("");
  const [add, setAdd] = useState(false);
  const [error, setError] = useState("");
  const results = state.records.filter((r) =>
    `${r.name} ${r.alias} ${r.identifier} ${r.source} ${r.reference}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  const sources = [...new Set(state.records.map((r) => r.source))];
  return (
    <>
      <Section
        title="Federated record query"
        subtitle="Search the records available to this case. Source counts reflect imported evidence."
        action={
          <button className="button" onClick={() => setAdd(!add)}>
            <Plus size={15} />
            Add source record
          </button>
        }
      >
        <form
          className="ops-search"
          onSubmit={(e) => {
            e.preventDefault();
            void commit(
              {
                queried: true,
                selected: [],
                accepted: [],
                excluded: [],
                locked: false,
                published: false,
              },
              "Fusion query executed",
              `Query: ${query || "all case identifiers"}; ${results.length} records in scope`,
            );
          }}
        >
          <label>
            <span>Identity, handle, transaction or source reference</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search account, alias or record reference…"
            />
          </label>
          <button className="button primary" disabled={saving}>
            <Search size={16} />
            Run fusion query
          </button>
        </form>
        <div className="source-results">
          {sources.map((source) => (
            <div key={source}>
              <Database size={17} />
              <strong>{source}</strong>
              <span>
                {state.records.filter((r) => r.source === source).length}{" "}
                records
              </span>
              <small>
                {state.queried ? "Query reviewed" : "Available in case"}
              </small>
            </div>
          ))}
        </div>
      </Section>
      {add ? (
        <Section
          title="Documented source import"
          subtitle="Add the actual source reference and extracted identifiers. This does not query an external agency database."
        >
          <form
            className="ops-form"
            onSubmit={(e) => {
              e.preventDefault();
              const form = new FormData(e.currentTarget);
              const value = (key: string) => String(form.get(key) || "").trim();
              if (!value("identifier") || !value("reference")) return;
              const record: SourceRecord = {
                id: `REC-${Date.now().toString(36).toUpperCase()}`,
                source: value("source"),
                reference: value("reference"),
                name: value("name"),
                alias: value("alias"),
                identifier: value("identifier"),
                kind: value("kind"),
                phone: value("phone"),
                locality: value("locality"),
                observed: value("observed"),
                quality: Number(form.get("quality")),
                detail: value("detail"),
              };
              void commit(
                { records: [...state.records, record], queried: false },
                "Source record imported",
                `${record.id} / ${record.source} / ${record.reference}`,
              ).then((saved) => {
                if (saved) setAdd(false);
              });
            }}
          >
            {[
              "source",
              "reference",
              "name",
              "alias",
              "identifier",
              "phone",
              "locality",
            ].map((key) => (
              <label key={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
                <input
                  name={key}
                  required={[
                    "source",
                    "reference",
                    "name",
                    "identifier",
                  ].includes(key)}
                  maxLength={200}
                />
              </label>
            ))}
            <label>
              Identifier type
              <select name="kind">
                <option>UPI</option>
                <option>Bank account</option>
                <option>Platform account</option>
                <option>Phone</option>
                <option>Email</option>
                <option>Contact reference</option>
                <option>Publisher account</option>
              </select>
            </label>
            <label>
              Observed time
              <input name="observed" type="datetime-local" required />
            </label>
            <label>
              Record quality (0–100)
              <input
                name="quality"
                type="number"
                min="0"
                max="100"
                defaultValue="70"
                required
              />
            </label>
            <label className="wide">
              Source extract / provenance note
              <textarea name="detail" required maxLength={1200} />
            </label>
            <button className="button primary" disabled={saving}>
              Import record
            </button>
          </form>
        </Section>
      ) : null}
      <Section
        title="Candidate pool"
        subtitle="Select records to compare. Shared names alone never merge identities."
      >
        <RecordTable records={state.queried ? results : []} selection="query" />
        <div className="ops-toolbar">
          <span>{state.selected.length} selected for entity resolution</span>
          <label className="button file-import">
            <Download size={15} />
            Import JSON
            <input
              type="file"
              accept="application/json,.json"
              onChange={async (e) => {
                setError("");
                try {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 25000)
                    throw new Error("Import must be smaller than 25 KB.");
                  const parsed: unknown = JSON.parse(await file.text());
                  if (!Array.isArray(parsed) || parsed.length > 30)
                    throw new Error(
                      "Provide an array of up to 30 source records.",
                    );
                  const records = parsed.map((r, index) => {
                    if (!r || typeof r !== "object")
                      throw new Error(`Invalid record ${index + 1}`);
                    const obj = r as Record<string, unknown>;
                    const strings = [
                      "source",
                      "reference",
                      "name",
                      "identifier",
                      "kind",
                      "detail",
                    ];
                    if (
                      strings.some(
                        (k) =>
                          typeof obj[k] !== "string" ||
                          !(obj[k] as string).trim(),
                      )
                    )
                      throw new Error(
                        `Record ${index + 1} needs source, reference, name, identifier, kind and detail.`,
                      );
                    const get = (k: string) =>
                      String(obj[k] || "").slice(
                        0,
                        k === "detail" ? 1200 : 200,
                      );
                    return {
                      id: `IMP-${Date.now()}-${index}`,
                      source: get("source"),
                      reference: get("reference"),
                      name: get("name"),
                      alias: get("alias"),
                      identifier: get("identifier"),
                      kind: get("kind"),
                      phone: get("phone"),
                      locality: get("locality"),
                      observed: get("observed"),
                      quality: Math.min(
                        100,
                        Math.max(0, Number(obj.quality) || 0),
                      ),
                      detail: get("detail"),
                    };
                  });
                  if (state.records.length + records.length > 40)
                    throw new Error("Keep case imports to 40 records.");
                  await commit(
                    { records: [...state.records, ...records], queried: false },
                    "Source batch imported",
                    `${records.length} records / ${file.name}`,
                  );
                } catch (err) {
                  setError((err as Error).message);
                } finally {
                  e.target.value = "";
                }
              }}
            />
          </label>
        </div>
        {error ? (
          <p className="error" role="alert">
            {error}
          </p>
        ) : null}
      </Section>
    </>
  );
}

function ResolutionStage() {
  const { state, commit, saving } = useInvestigation();
  const candidates = useMemo(
    () =>
      state.records.filter(
        (r) => state.selected.includes(r.id) && !state.excluded.includes(r.id),
      ),
    [state.records, state.selected, state.excluded],
  );
  const clusters = useMemo(() => clusterRecords(candidates), [candidates]);
  const [selected, setSelected] = useState("");
  const active = clusters.find((c) => c.id === selected) || clusters[0];
  return (
    <Section
      title="Entity resolution"
      subtitle="Exact identifiers establish candidate links. The operator reviews aliases, missing fields and conflicts."
    >
      <div className="resolution-grid">
        <div className="cluster-list">
          {clusters.map((c) => (
            <button
              key={c.id}
              className={active?.id === c.id ? "selected" : ""}
              onClick={() => setSelected(c.id)}
            >
              <GitBranch size={19} />
              <div>
                <strong>
                  {c.id} · {c.records[0].name}
                </strong>
                <span>
                  {c.records.length} linked records · quality {c.score}/100
                </span>
              </div>
              <ArrowRight size={16} />
            </button>
          ))}
        </div>
        {active ? (
          <div className="cluster-detail">
            <div className="ops-split">
              <div className="agreement-box">
                <h4>Agreements</h4>
                {active.agreements.map((a) => (
                  <p key={a}>
                    <Check size={15} />
                    {a}
                  </p>
                ))}
              </div>
              <div className="conflict-box">
                <h4>Conflicts / review</h4>
                {active.conflicts.length ? (
                  active.conflicts.map((c) => <p key={c}>{c}</p>)
                ) : (
                  <p>No conflicting fields in these records.</p>
                )}
              </div>
            </div>
            <h4>Linked records</h4>
            {active.records.map((r) => (
              <div className="cluster-record" key={r.id}>
                <div>
                  <strong>
                    {r.id} · {r.name}
                  </strong>
                  <code>{r.identifier}</code>
                  <small>
                    {r.source} / {r.reference}
                  </small>
                </div>
                <button
                  className="button"
                  disabled={saving || active.records.length === 1}
                  onClick={() =>
                    void commit(
                      {
                        excluded: [...state.excluded, r.id],
                        accepted: state.accepted.filter((id) => id !== r.id),
                        locked: false,
                        published: false,
                      },
                      "Record split from entity cluster",
                      `${r.id}: separated for independent review`,
                    )
                  }
                >
                  <Split size={14} />
                  Split off
                </button>
              </div>
            ))}
            <button
              className="button primary"
              disabled={saving}
              onClick={() =>
                void commit(
                  {
                    accepted: active.records.map((r) => r.id),
                    canonicalId: "",
                    locked: false,
                    published: false,
                  },
                  "Entity cluster accepted",
                  `${active.id}: ${active.records.map((r) => r.id).join(", ")}`,
                )
              }
            >
              <ShieldCheck size={16} />
              {state.accepted.join() === active.records.map((r) => r.id).join()
                ? "Cluster accepted"
                : "Accept this cluster"}
            </button>
          </div>
        ) : (
          <div className="ops-empty">
            Select candidate records in the fusion query.
          </div>
        )}
      </div>
      {state.excluded.length ? (
        <div className="ops-toolbar">
          <span>Separated records: {state.excluded.join(", ")}</span>
          <button
            className="text-link"
            disabled={saving}
            onClick={() =>
              void commit(
                { excluded: [], accepted: [], locked: false, published: false },
                "Cluster split reversed",
                "Separated records returned to candidate pool",
              )
            }
          >
            Restore separated records
          </button>
        </div>
      ) : null}
    </Section>
  );
}

function DedupStage() {
  const { state, commit, saving } = useInvestigation();
  const profile = canonicalProfile(state);
  const [reason, setReason] = useState(state.lockReason);
  const records = state.records.filter((r) => state.accepted.includes(r.id));
  return (
    <>
      <Section
        title="De-duplication & canonical identity"
        subtitle="Rank source quality, retain aliases and references, exclude duplicates, and lock a reviewed canonical profile."
        action={
          state.locked ? (
            <span className="status-chip success">
              <LockKeyhole size={14} />
              Profile locked
            </span>
          ) : undefined
        }
      >
        <div className="dedup-metrics">
          <div>
            <strong>{records.length}</strong>
            <span>Records compared</span>
          </div>
          <div>
            <strong>{profile.records.length}</strong>
            <span>Provenance retained</span>
          </div>
          <div>
            <strong>{profile.aliases.length}</strong>
            <span>Unique aliases</span>
          </div>
          <div>
            <strong>{profile.removed}</strong>
            <span>Excluded records</span>
          </div>
        </div>
        <div className="ops-toolbar">
          <span>
            Rule: same identifier and type → one entity; all retained references
            stay traceable.
          </span>
          <button
            className="button"
            disabled={saving || state.locked || !profile.records.length}
            onClick={() => {
              const ranked = [...profile.records].sort(
                (a, b) => b.quality - a.quality,
              );
              void commit(
                { canonicalId: ranked[0].id },
                "De-duplication analysis completed",
                `Ranked ${ranked.length} records by documented source quality; preferred ${ranked[0].id}`,
              );
            }}
          >
            Run de-duplication
          </button>
        </div>
        <RecordTable
          records={[...records].sort((a, b) => b.quality - a.quality)}
          selection="canonical"
        />
        <div className="retain-records">
          {records.map((r) => (
            <label key={r.id}>
              <input
                type="checkbox"
                checked={!state.excluded.includes(r.id)}
                disabled={saving || state.locked || state.canonicalId === r.id}
                onChange={(e) =>
                  void commit(
                    {
                      excluded: e.target.checked
                        ? state.excluded.filter((id) => id !== r.id)
                        : [...state.excluded, r.id],
                    },
                    e.target.checked ? "Record retained" : "Duplicate excluded",
                    `${r.id} / ${r.reference}`,
                  )
                }
              />
              Retain {r.id}
            </label>
          ))}
        </div>
      </Section>
      <Section
        title="Canonical profile builder"
        subtitle="Choose the preferred source record. Differences are preserved in the review history."
      >
        {profile.canonical ? (
          <>
            <div className="canonical-profile">
              <div className="canonical-avatar">
                <Users size={28} />
              </div>
              <div>
                <small>
                  {profile.canonical.id} · {profile.canonical.kind}
                </small>
                <h3>{profile.canonical.name}</h3>
                <code>{profile.canonical.identifier}</code>
              </div>
              <span className="quality-score">
                {profile.canonical.quality}/100 quality
              </span>
            </div>
            <div className="ops-field-grid">
              <div>
                <span>Alias union</span>
                <strong>{profile.aliases.join(" / ")}</strong>
              </div>
              <div>
                <span>Source references</span>
                <strong>
                  {profile.records.map((r) => r.reference).join(" / ")}
                </strong>
              </div>
              <div>
                <span>Locality</span>
                <strong>{profile.canonical.locality}</strong>
              </div>
              <div>
                <span>Contact reference</span>
                <strong>{profile.canonical.phone || "Not recorded"}</strong>
              </div>
            </div>
            <label className="ops-label">
              Canonical selection rationale
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                maxLength={1200}
                disabled={state.locked}
                placeholder="Explain the source preference and how conflicting fields were reviewed…"
              />
            </label>
            <button
              className="button primary"
              disabled={saving || state.locked || !reason.trim()}
              onClick={() =>
                void commit(
                  { locked: true, lockReason: reason.trim() },
                  "Canonical identity locked",
                  `${profile.canonical!.id}: ${reason.trim()}`,
                )
              }
            >
              <LockKeyhole size={16} />
              {state.locked
                ? "Canonical identity locked"
                : "Lock canonical identity"}
            </button>
          </>
        ) : (
          <div className="ops-empty">
            <GitBranch size={28} />
            <p>Run de-duplication or select a canonical source above.</p>
          </div>
        )}
      </Section>
    </>
  );
}

function PublishStage() {
  const { state, commit, saving, item } = useInvestigation();
  const profile = canonicalProfile(state);
  return (
    <Section
      title={flowSteps[item.mission][4]}
      subtitle="Publish the locked profile to this workspace’s intelligence register. External dissemination remains a separate authorised action."
    >
      <div className="canonical-profile">
        <LockKeyhole size={30} />
        <div>
          <h3>{profile.canonical?.name}</h3>
          <code>{profile.canonical?.identifier}</code>
          <p>
            {profile.records.length} source references ·{" "}
            {profile.aliases.length} aliases
          </p>
        </div>
      </div>
      <label className="ops-label">
        Access scope
        <select
          value={state.scope}
          disabled={saving || state.published}
          onChange={(e) =>
            void commit(
              { scope: e.target.value },
              "Intelligence access scope changed",
              e.target.value,
            )
          }
        >
          <option>Assigned investigation team</option>
          <option>Command supervisor and assigned team</option>
          <option>Threat intelligence hub</option>
          <option>Restricted protection desk</option>
        </select>
      </label>
      <div className="ops-field-grid">
        <div>
          <span>Intelligence reference</span>
          <strong>INT-{item.id.slice(-4)}</strong>
        </div>
        <div>
          <span>Priority</span>
          <strong>{item.priority}</strong>
        </div>
        <div>
          <span>Review basis</span>
          <strong>{state.lockReason}</strong>
        </div>
      </div>
      <button
        className="button primary"
        disabled={saving || state.published || !state.locked}
        onClick={() =>
          void commit(
            { published: true },
            "Reviewed profile published",
            `INT-${item.id.slice(-4)} / ${state.scope}`,
          )
        }
      >
        <ShieldCheck size={16} />
        {state.published
          ? "Published to case intelligence"
          : "Publish reviewed profile"}
      </button>
    </Section>
  );
}

function EvidenceSearchStage() {
  const { state, item, commit, saving } = useInvestigation();
  const [query, setQuery] = useState("");
  const list = item.evidence.filter((e) =>
    `${e.name} ${e.source} ${e.type}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <Section
      title={flowSteps[item.mission][5]}
      subtitle="Search the preserved case evidence; inspect original source references before verification."
    >
      <label className="ops-label">
        Evidence search
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search receipt, account, transcript or location reference…"
        />
      </label>
      {list.map((e) => (
        <div className="ops-evidence-line" key={e.name}>
          <FileText size={21} />
          <div>
            <strong>{e.name}</strong>
            <p>
              {e.source} · {e.type} · {e.time}
            </p>
          </div>
          <span className="status-chip">{e.status}</span>
        </div>
      ))}
      {!list.length ? (
        <p className="ops-empty">No evidence matches this search.</p>
      ) : null}
      <button
        className="button primary"
        disabled={saving || !item.evidence.length}
        onClick={() =>
          void commit(
            {
              checks: { ...state.checks, search: true },
              findings: {
                ...state.findings,
                search: query || "All registered evidence",
              },
            },
            "Evidence search reviewed",
            `${list.length} results; scope: ${query || "all registered evidence"}`,
          )
        }
      >
        <Search size={16} />
        {state.checks.search ? "Search reviewed" : "Record search review"}
      </button>
    </Section>
  );
}

function VerificationStage() {
  const { state, item, commit, saving } = useInvestigation();
  const [notes, setNotes] = useState<Record<string, string>>({});
  return (
    <Section
      title={flowSteps[item.mission][6]}
      subtitle="Gate A: source evidence reviewed. Gate B: operator confirms or rejects each finding with a recorded reason."
    >
      {item.evidence.map((e, i) => (
        <div className="verification-card" key={e.name}>
          <div className="ops-toolbar">
            <h4>
              E-{i + 1} · {e.name}
            </h4>
            <span
              className={`status-chip ${state.evidenceDecision[String(i)] === "Verified" ? "success" : ""}`}
            >
              {state.evidenceDecision[String(i)] || "Awaiting review"}
            </span>
          </div>
          <p>
            {e.source} · {e.type} · {e.time}
          </p>
          <label className="ops-label">
            Review reason
            <input
              value={notes[String(i)] ?? state.findings[`evidence-${i}`] ?? ""}
              onChange={(ev) =>
                setNotes({ ...notes, [String(i)]: ev.target.value })
              }
              maxLength={800}
              placeholder="Record what was checked against the source…"
            />
          </label>
          <div className="ops-toolbar">
            {["Verified", "Rejected", "Further review"].map((decision) => (
              <button
                className={`button ${decision === "Verified" ? "primary" : ""}`}
                key={decision}
                disabled={
                  saving ||
                  !(notes[String(i)] ?? state.findings[`evidence-${i}`])?.trim()
                }
                onClick={() =>
                  void commit(
                    {
                      evidenceDecision: {
                        ...state.evidenceDecision,
                        [String(i)]: decision,
                      },
                      findings: {
                        ...state.findings,
                        [`evidence-${i}`]:
                          notes[String(i)] ?? state.findings[`evidence-${i}`],
                      },
                    },
                    "Evidence decision recorded",
                    `E-${i + 1}: ${decision}; ${notes[String(i)] ?? state.findings[`evidence-${i}`]}`,
                  )
                }
              >
                {decision}
              </button>
            ))}
          </div>
        </div>
      ))}
    </Section>
  );
}

function CorrelationStage({ cases }: { cases: Case[] }) {
  const { state, item, commit, saving } = useInvestigation();
  const profile = canonicalProfile(state);
  const [note, setNote] = useState(state.findings.correlation || "");
  const linked = cases.filter(
    (c) =>
      c.id !== item.id &&
      profile.canonical?.identifier &&
      JSON.stringify(c.entities)
        .toLowerCase()
        .includes(profile.canonical.identifier.toLowerCase()),
  );
  return (
    <Section
      title={flowSteps[item.mission][7]}
      subtitle="Review the source relationships and distinguish established links from hypotheses."
    >
      <div className="relationship-map">
        <div className="relationship-centre">
          <GitBranch size={25} />
          <strong>{profile.canonical?.name}</strong>
          <code>{profile.canonical?.identifier}</code>
        </div>
        <div className="relationship-sources">
          {profile.records.map((r) => (
            <div key={r.id}>
              <Database size={17} />
              <strong>{r.source}</strong>
              <small>{r.reference}</small>
              <span>Exact identifier match</span>
            </div>
          ))}
        </div>
      </div>
      <div className="ops-toolbar">
        <strong>Cross-case correlation</strong>
        <span>{linked.length} matching cases in this workspace</span>
      </div>
      {linked.map((c) => (
        <p key={c.id}>
          {c.id} · {c.title}
        </p>
      ))}
      <label className="ops-label">
        Analyst correlation finding
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={1500}
          placeholder="Document established relationships, unsupported links and next enquiries…"
        />
      </label>
      <button
        className="button primary"
        disabled={saving || !note.trim()}
        onClick={() =>
          void commit(
            {
              checks: { ...state.checks, correlation: true },
              findings: { ...state.findings, correlation: note },
            },
            "Correlation finding recorded",
            note,
          )
        }
      >
        <GitBranch size={16} />
        Save correlation finding
      </button>
    </Section>
  );
}

function AssessmentStage() {
  const { item } = useInvestigation();
  const assessment = domainChecks[item.mission];
  return (
    <Section
      title={assessment.title}
      subtitle="Complete the mission-specific assessment against the case record."
    >
      {item.isDemo &&
      [
        "US4C-2026-1042",
        "US4C-2026-1041",
        "US4C-2026-1040",
        "US4C-2026-1039",
      ].includes(item.id) ? (
        <div className="ops-field-grid">
          {assessment.fields.map((f) => (
            <div key={f.label}>
              <span>{f.label}</span>
              <strong>{f.value}</strong>
            </div>
          ))}
        </div>
      ) : (
        <div className="ops-field-grid">
          {item.entities.map((f) => (
            <div key={f.label}>
              <span>{f.label}</span>
              <strong>{f.value}</strong>
            </div>
          ))}
        </div>
      )}
      {item.mission === "fraud" ? (
        <div className="money-trail">
          <div>
            <span>Reported transfer</span>
            <strong>{money(item.amount)}</strong>
          </div>
          <ArrowRight />
          <div>
            <span>Recorded hold</span>
            <strong>{money(item.frozen)}</strong>
          </div>
          <ArrowRight />
          <div>
            <span>Balance to reconcile</span>
            <strong>{money(Math.max(0, item.amount - item.frozen))}</strong>
          </div>
        </div>
      ) : null}
      {assessment.checks.map((text, i) => (
        <CheckAction key={text} id={`domain-${i}`}>
          {text}
        </CheckAction>
      ))}
    </Section>
  );
}

function LocationStage() {
  const { item, state, commit, saving } = useInvestigation();
  const [note, setNote] = useState(state.findings.location || "");
  return (
    <Section
      title={flowSteps[item.mission][9]}
      subtitle="Record the jurisdiction, evidence basis and location confidence. A reported place is not automatically a verified location."
    >
      <div className="jurisdiction-panel">
        <MapPin size={34} />
        <div>
          <small>Reported locality</small>
          <h3>{item.location}</h3>
          <p>
            {item.mission === "fraud"
              ? "Complainant jurisdiction; beneficiary location requires independent verification."
              : item.mission === "content"
                ? "Separate the claimed location from the recording location."
                : "Confirm the operational location before field assignment."}
          </p>
        </div>
      </div>
      <label className="ops-label">
        Location / jurisdiction finding
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={1000}
          placeholder="Record verified area, source, uncertainty and responsible jurisdiction…"
        />
      </label>
      <button
        className="button primary"
        disabled={saving || !note.trim()}
        onClick={() =>
          void commit(
            {
              findings: { ...state.findings, location: note },
              checks: { ...state.checks, location: true },
            },
            "Location review completed",
            note,
          )
        }
      >
        <MapPin size={16} />
        Confirm jurisdiction review
      </button>
    </Section>
  );
}

function CommandStage() {
  const { item, state, commit, saving } = useInvestigation();
  const [refs, setRefs] = useState<Record<string, string>>({});
  return (
    <>
      <Section
        title={flowSteps[item.mission][10]}
        subtitle="Prepare assignments, record acknowledgements, and close tasks with a reference. Status changes are recorded in the audit log."
      >
        {state.tasks.map((task) => (
          <div className="command-task" key={task.id}>
            <div className="ops-toolbar">
              <h4>{task.agency}</h4>
              <span
                className={`status-chip ${task.status === "Completed" ? "success" : ""}`}
              >
                {task.status}
              </span>
            </div>
            <p>{task.task}</p>
            <label className="ops-label">
              Acknowledgement / completion reference
              <input
                value={refs[task.id] ?? task.reference}
                onChange={(e) =>
                  setRefs({ ...refs, [task.id]: e.target.value })
                }
                placeholder="Enter request ID, response reference or handover note…"
                maxLength={400}
              />
            </label>
            <div className="task-controls">
              {[
                "Request prepared",
                "Acknowledged",
                "In progress",
                "Completed",
              ].map((status) => (
                <button
                  className="button"
                  key={status}
                  disabled={
                    saving ||
                    task.status === status ||
                    !(refs[task.id] ?? task.reference).trim()
                  }
                  onClick={() =>
                    void commit(
                      {
                        tasks: state.tasks.map((t) =>
                          t.id === task.id
                            ? {
                                ...t,
                                status,
                                reference: refs[task.id] ?? task.reference,
                              }
                            : t,
                        ),
                      },
                      "Coordination status recorded",
                      `${task.agency}: ${status} / ${refs[task.id] ?? task.reference}`,
                      {
                        actions: item.actions.map((a) =>
                          a.agency === task.agency ? { ...a, status } : a,
                        ),
                      },
                    )
                  }
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        ))}
        <form
          className="ops-form"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const agency = String(form.get("agency")).trim();
            const task = String(form.get("task")).trim();
            void commit(
              {
                tasks: [
                  ...state.tasks,
                  {
                    id: `TASK-${Date.now()}`,
                    agency,
                    task,
                    status: "Pending",
                    reference: "",
                  },
                ],
              },
              "Coordination task assigned",
              `${agency}: ${task}`,
              {
                actions: [...item.actions, { agency, task, status: "Pending" }],
              },
            );
            e.currentTarget.reset();
          }}
        >
          <label>
            Responsible unit
            <input name="agency" required maxLength={150} />
          </label>
          <label>
            Assignment
            <input name="task" required maxLength={400} />
          </label>
          <button className="button" disabled={saving}>
            <Plus size={15} />
            Add assignment
          </button>
        </form>
      </Section>
    </>
  );
}

function ClosureStage() {
  const { state, item, commit, saving } = useInvestigation();
  const [outcome, setOutcome] = useState(state.outcome);
  const [followUp, setFollowUp] = useState(state.followUp);
  return (
    <Section
      title="Resolution & handover"
      subtitle="Record the result, outstanding enquiries, follow-up owner and next review date."
    >
      <div className="ops-field-grid">
        <div>
          <span>Evidence decisions</span>
          <strong>
            {
              Object.values(state.evidenceDecision).filter(
                (v) => v === "Verified",
              ).length
            }{" "}
            verified /{" "}
            {
              Object.values(state.evidenceDecision).filter(
                (v) => v === "Rejected",
              ).length
            }{" "}
            rejected
          </strong>
        </div>
        <div>
          <span>Coordination completed</span>
          <strong>
            {state.tasks.filter((t) => t.status === "Completed").length} /{" "}
            {state.tasks.length}
          </strong>
        </div>
        <div>
          <span>Canonical profile</span>
          <strong>{canonicalProfile(state).canonical?.name}</strong>
        </div>
        <div>
          <span>Audit events</span>
          <strong>{state.audit.length}</strong>
        </div>
      </div>
      <label className="ops-label">
        Resolution statement
        <textarea
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          maxLength={2000}
          placeholder="Record verified response, recovery or protection outcome…"
        />
      </label>
      <label className="ops-label">
        Follow-up owner / next review
        <textarea
          value={followUp}
          onChange={(e) => setFollowUp(e.target.value)}
          maxLength={1000}
          placeholder="Record handover unit, remaining enquiries and review date…"
        />
      </label>
      <button
        className="button primary"
        disabled={saving || !outcome.trim() || !followUp.trim()}
        onClick={() =>
          void commit(
            {
              outcome: outcome.trim(),
              followUp: followUp.trim(),
              completed: [
                ...new Set([...state.completed, flowSteps[item.mission][11]]),
              ],
            },
            "Case resolved",
            `${outcome}; Follow-up: ${followUp}`,
            { stage: 5, outcome: `${outcome} Follow-up: ${followUp}` },
          )
        }
      >
        <ShieldCheck size={16} />
        Record resolution & handover
      </button>
    </Section>
  );
}

const workflowPhases = [
  { title: "Intake", caption: "Complaint & source evidence", stages: [0] },
  {
    title: "Identity fusion",
    caption: "Query, resolve & de-duplicate",
    stages: [1, 2, 3, 4],
  },
  {
    title: "Investigation",
    caption: "Evidence, assessment & location",
    stages: [5, 6, 7, 8, 9],
  },
  {
    title: "Response & closure",
    caption: "Coordinate, acknowledge & hand over",
    stages: [10, 11],
  },
];
function WorkflowNavigation() {
  const { item, state, commit, saving } = useInvestigation();
  const steps = flowSteps[item.mission];
  const activePhase = workflowPhases.findIndex((p) =>
    p.stages.includes(state.step),
  );
  return (
    <div className="phase-navigation">
      <nav className="phase-overview" aria-label="Investigation phases">
        {workflowPhases.map((phase, index) => {
          const done = phase.stages.filter((i) =>
            state.completed.includes(steps[i]),
          ).length;
          const enabled = index === activePhase || done > 0;
          return (
            <button
              key={phase.title}
              className={`phase-${index} ${index === activePhase ? "current" : ""} ${done === phase.stages.length ? "complete" : ""}`}
              disabled={saving || !enabled}
              onClick={() => {
                const step =
                  index === activePhase
                    ? state.step
                    : phase.stages.find((i) =>
                        state.completed.includes(steps[i]),
                      )!;
                void commit({ step }, "Workflow stage opened", steps[step]);
              }}
            >
              <span>
                {done === phase.stages.length ? (
                  <Check size={17} />
                ) : (
                  String(index + 1).padStart(2, "0")
                )}
              </span>
              <div>
                <strong>{phase.title}</strong>
                <small>{phase.caption}</small>
              </div>
              <b>
                {done}/{phase.stages.length}
              </b>
            </button>
          );
        })}
      </nav>
      <nav className="phase-stages" aria-label="Current phase stages">
        {workflowPhases[activePhase].stages.map((index) => (
          <button
            key={index}
            className={
              index === state.step
                ? "current"
                : state.completed.includes(steps[index])
                  ? "complete"
                  : ""
            }
            disabled={
              saving ||
              (!state.completed.includes(steps[index]) && index !== state.step)
            }
            onClick={() =>
              void commit(
                { step: index },
                "Workflow stage opened",
                steps[index],
              )
            }
          >
            {state.completed.includes(steps[index]) ? (
              <Check size={13} />
            ) : (
              <span>{String(index + 1).padStart(2, "0")}</span>
            )}
            {steps[index]}
          </button>
        ))}
      </nav>
    </div>
  );
}
export default function FusionWorkflow(props: Props) {
  const { item, save, saving } = props;
  const state =
    item.investigation?.version === 2
      ? item.investigation
      : initialInvestigation(item);
  const steps = flowSteps[item.mission];
  const [error, setError] = useState("");
  const [audit, setAudit] = useState(false);
  const [summary, setSummary] = useState(false);
  const [auditQuery, setAuditQuery] = useState("");
  const [serverAudit, setServerAudit] = useState<AuditEvent[]>([]);
  const [auditBusy, setAuditBusy] = useState(false);
  useEffect(() => {
    if (!audit || item.isDemo || !database) return;
    let mounted = true;
    setAuditBusy(true);
    void database
      .from("us4c_audit_events")
      .select("id,event_at,actor_id,action,detail,changed_fields")
      .eq("case_id", item.id)
      .order("event_at", { ascending: false })
      .limit(200)
      .then(({ data, error }) => {
        if (!mounted) return;
        setAuditBusy(false);
        if (error) {
          setError(
            "Server audit could not be loaded. Retry opening the audit log.",
          );
          return;
        }
        setServerAudit(
          data.map((row) => ({
            id: String(row.id),
            at: row.event_at,
            actor: row.actor_id
              ? "Operator " + row.actor_id.slice(0, 8)
              : "System service",
            action: row.action,
            detail:
              (row.detail?.operator_note || "") +
              " [Changed: " +
              row.changed_fields.join(", ") +
              "]",
            stage: row.detail?.stage || "Case record",
          })),
        );
      });
    return () => {
      mounted = false;
    };
  }, [audit, item.id, item.isDemo, state.audit.length]);
  const auditEvents = item.isDemo ? [...state.audit].reverse() : serverAudit;
  const previousStep = useRef(state.step);
  useEffect(() => {
    if (previousStep.current !== state.step) {
      previousStep.current = state.step;
      document.querySelector(".investigation-workspace")?.scrollIntoView({
        behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "auto"
          : "smooth",
        block: "start",
      });
    }
  }, [state.step]);
  const commit = async (
    patch: Partial<Investigation>,
    action: string,
    detail: string,
    casePatch?: Partial<Case>,
  ) => {
    setError("");
    try {
      const invalidates = ![
        "Workflow stage opened",
        "Workflow stage completed",
        "Case resolved",
      ].includes(action);
      const next = {
        ...state,
        ...(invalidates
          ? {
              completed: state.completed.filter(
                (stage) => steps.indexOf(stage) < state.step,
              ),
            }
          : {}),
        ...patch,
      };
      const event = {
        id: crypto.randomUUID(),
        at: new Date().toISOString(),
        actor: item.isDemo ? "Training operator" : "Signed-in operator",
        action,
        detail,
        stage: steps[state.step],
      };
      await save({
        ...item,
        ...casePatch,
        ...(patch.tasks
          ? {
              actions: patch.tasks.map(({ agency, task, status }) => ({
                agency,
                task,
                status,
              })),
            }
          : {}),
        investigation: { ...next, audit: [...state.audit, event].slice(-120) },
        timeline: [
          ...item.timeline,
          { time: nowIST(), text: `${action}: ${detail}` },
        ].slice(-120),
      });
      return true;
    } catch (e) {
      setError((e as Error).message);
      return false;
    }
  };
  const reason = gateReason(state, item);
  const profile = canonicalProfile(state);
  const exportAudit = () => {
    const blob = new Blob(
      [
        JSON.stringify(
          {
            caseId: item.id,
            exportedAt: new Date().toISOString(),
            events: auditEvents,
          },
          null,
          2,
        ),
      ],
      { type: "application/json" },
    );
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${item.id}-audit.json`;
    link.click();
    URL.revokeObjectURL(url);
  };
  return (
    <InvestigationContext.Provider value={{ item, state, saving, commit }}>
      <div
        className={`investigation-workspace mission-${item.mission}`}
        data-phase={workflowPhases.findIndex((p) =>
          p.stages.includes(state.step),
        )}
      >
        <div className="investigation-toolbar">
          <div>
            <span className="eyebrow">INVESTIGATION WORKSPACE</span>
            <h2>{steps[state.step]}</h2>
          </div>
          <div>
            <button
              className={`button ${audit ? "selected" : ""}`}
              onClick={() => setAudit(!audit)}
            >
              <FileText size={16} />
              Audit log <span>{state.audit.length}</span>
            </button>
            <button className="button" onClick={() => setSummary(!summary)}>
              <Users size={15} />
              {summary ? "Hide case summary" : "Case summary"}
            </button>
            <button className="button" onClick={props.openChat}>
              Analyst assistant
            </button>
            {["safety", "distress"].includes(item.mission) ? (
              <button
                className="button urgent-button"
                disabled={
                  saving || state.tasks.some((t) => t.id === "URG-review")
                }
                onClick={() =>
                  void commit(
                    {
                      tasks: [
                        ...state.tasks,
                        {
                          id: "URG-review",
                          agency: "Emergency Coordination Desk",
                          task: "Immediate protection review",
                          status: "Request prepared",
                          reference: `${item.id}/URG`,
                        },
                      ],
                    },
                    "Urgent protection review initiated",
                    "Emergency Coordination Desk assigned; acknowledgement pending",
                  )
                }
              >
                Urgent protection review
              </button>
            ) : null}
          </div>
        </div>
        <WorkflowNavigation />
        <div
          className={`investigation-layout ${summary ? "with-summary" : "focused"}`}
        >
          <div className="workflow-content">
            {audit ? (
              <Section
                title="Operator audit log"
                subtitle={
                  item.isDemo
                    ? "Exercise history: actor, timestamp, stage and source references."
                    : "Server-recorded audit: timestamp and authenticated actor; browser clients cannot edit or delete these events."
                }
                action={
                  <button className="button" onClick={exportAudit}>
                    <Download size={15} />
                    Export audit
                  </button>
                }
              >
                <label className="ops-label">
                  Filter audit events
                  <input
                    value={auditQuery}
                    onChange={(e) => setAuditQuery(e.target.value)}
                    placeholder="Search action, stage or reference…"
                  />
                </label>
                <div className="audit-events">
                  {auditEvents
                    .filter((event) =>
                      JSON.stringify(event)
                        .toLowerCase()
                        .includes(auditQuery.toLowerCase()),
                    )
                    .map((event) => (
                      <article key={event.id}>
                        <div>
                          <span className="audit-dot" />
                          <strong>{event.action}</strong>
                          <time>
                            {new Date(event.at).toLocaleString("en-IN", {
                              timeZone: "Asia/Kolkata",
                            })}{" "}
                            IST
                          </time>
                        </div>
                        <p>{event.detail}</p>
                        <small>
                          {event.actor} · {event.stage} · {event.id.slice(0, 8)}
                        </small>
                      </article>
                    ))}
                  {auditBusy ? (
                    <div className="ops-empty" role="status">
                      Loading server audit…
                    </div>
                  ) : !auditEvents.length ? (
                    <div className="ops-empty">
                      Saved operator actions will appear here.
                    </div>
                  ) : null}
                </div>
              </Section>
            ) : (
              <>
                {state.step === 0 ? <IntakeStage /> : null}
                {state.step === 1 ? <FusionQueryStage /> : null}
                {state.step === 2 ? <ResolutionStage /> : null}
                {state.step === 3 ? <DedupStage /> : null}
                {state.step === 4 ? <PublishStage /> : null}
                {state.step === 5 ? <EvidenceSearchStage /> : null}
                {state.step === 6 ? <VerificationStage /> : null}
                {state.step === 7 ? (
                  <CorrelationStage cases={props.cases} />
                ) : null}
                {state.step === 8 ? <AssessmentStage /> : null}
                {state.step === 9 ? <LocationStage /> : null}
                {state.step === 10 ? <CommandStage /> : null}
                {state.step === 11 ? <ClosureStage /> : null}
                <div className="workflow-footer">
                  <button
                    className="button"
                    disabled={saving || state.step === 0}
                    onClick={() =>
                      void commit(
                        { step: state.step - 1 },
                        "Workflow stage opened",
                        steps[state.step - 1],
                      )
                    }
                  >
                    <ArrowLeft size={15} />
                    Back
                  </button>
                  <div aria-live="polite">
                    {reason || "Review complete. Ready for the next stage."}
                  </div>
                  {state.step < 11 ? (
                    <button
                      className="button primary"
                      disabled={saving || !!reason}
                      onClick={() =>
                        void commit(
                          {
                            step: state.step + 1,
                            completed: [
                              ...new Set([
                                ...state.completed,
                                steps[state.step],
                              ]),
                            ],
                          },
                          "Workflow stage completed",
                          steps[state.step],
                        )
                      }
                    >
                      Continue to {steps[state.step + 1]}
                      <ArrowRight size={15} />
                    </button>
                  ) : (
                    <span className="status-chip">
                      {item.stage === 5 ? "Resolved" : "Closure review"}
                    </span>
                  )}
                </div>
              </>
            )}
            {error ? (
              <p className="error" role="alert">
                {error}
              </p>
            ) : null}
          </div>
          {summary ? (
            <aside className="investigation-summary">
              <span className="eyebrow">CASE CONTROL</span>
              <h3>{item.id}</h3>
              <span
                className={`status-chip ${item.priority === "Critical" ? "critical" : ""}`}
              >
                {item.priority} priority
              </span>
              <dl>
                <dt>Assigned desk</dt>
                <dd>{item.unit}</dd>
                <dt>Source records</dt>
                <dd>
                  {state.records.length} available / {state.selected.length}{" "}
                  selected
                </dd>
                <dt>Canonical identity</dt>
                <dd>{profile.canonical?.name || "Awaiting resolution"}</dd>
                <dt>Review gate</dt>
                <dd>
                  {state.locked ? "Identity locked" : "Identity review pending"}
                </dd>
                <dt>Publication</dt>
                <dd>
                  {state.published
                    ? "INT-" + item.id.slice(-4)
                    : "Not published"}
                </dd>
                <dt>Evidence decisions</dt>
                <dd>
                  {Object.keys(state.evidenceDecision).length} /{" "}
                  {item.evidence.length} reviewed
                </dd>
                <dt>Task completion</dt>
                <dd>
                  {state.tasks.filter((t) => t.status === "Completed").length} /{" "}
                  {state.tasks.length}
                </dd>
              </dl>
              <h4>Latest operator action</h4>
              <p>
                {state.audit.slice(-1)[0]?.action || "No actions recorded yet"}
              </p>
              <small>
                {state.audit.slice(-1)[0]?.detail ||
                  "Start with intake review."}
              </small>
              {item.mission === "distress" || item.mission === "safety" ? (
                <div className="urgent-action">
                  <strong>Immediate protection</strong>
                  <p>
                    Urgent welfare or protection coordination can be recorded
                    before identity fusion is complete.
                  </p>
                  <button
                    className="button full"
                    disabled={
                      saving || state.tasks.some((t) => t.id === "URG-review")
                    }
                    onClick={() =>
                      void commit(
                        {
                          tasks: [
                            ...state.tasks,
                            {
                              id: "URG-review",
                              agency: "Emergency Coordination Desk",
                              task: "Immediate protection review",
                              status: "Request prepared",
                              reference: `${item.id}/URG`,
                            },
                          ],
                        },
                        "Urgent protection review initiated",
                        "Emergency Coordination Desk assigned; acknowledgement pending",
                      )
                    }
                  >
                    Initiate urgent review
                  </button>
                </div>
              ) : null}
            </aside>
          ) : null}
        </div>
      </div>
    </InvestigationContext.Provider>
  );
}
