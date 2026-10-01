import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import {
  ArrowRight,
  CalendarDays,
  Download,
  FileText,
  Printer,
  ShieldCheck,
} from "lucide-react";
import { type Case, missions, money } from "./data";
function exportFile(name: string, value: string, type: string) {
  const url = URL.createObjectURL(new Blob([value], { type }));
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
}
function safeCSV(value: unknown) {
  const text = String(value ?? "");
  return (
    '"' +
    (/^\s*[=+@-]/.test(text) ? "'" + text : text).replace(/"/g, '""') +
    '"'
  );
}
function ReportSection({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="report-section">
      <header>
        <span className="eyebrow">{subtitle}</span>
        <h2>{title}</h2>
      </header>
      {children}
    </section>
  );
}
export default function OperationsReports({ cases }: { cases: Case[] }) {
  const [mission, setMission] = useState("all");
  const [range, setRange] = useState("all");
  const [view, setView] = useState("outcomes");
  const [selected, setSelected] = useState("");
  const [exported, setExported] = useState("");
  const rows = useMemo(
    () =>
      cases.filter(
        (c) =>
          (mission === "all" || c.mission === mission) &&
          (range === "all" ||
            Date.now() - new Date(c.createdAt).getTime() <=
              Number(range) * 86400000),
      ),
    [cases, mission, range],
  );
  const report = useMemo(() => {
    const resolved = rows.filter((c) => c.stage === 5);
    const actions = rows.flatMap((c) => c.actions);
    return {
      active: rows.length - resolved.length,
      resolved,
      reported: rows.reduce((s, c) => s + c.amount, 0),
      hold: rows.reduce((s, c) => s + c.frozen, 0),
      actions: actions.length,
      completed: actions.filter((a) => a.status === "Completed").length,
      critical: rows.filter((c) => c.priority === "Critical" && c.stage < 5)
        .length,
      events: rows.reduce(
        (s, c) => s + (c.investigation?.audit.length || 0),
        0,
      ),
    };
  }, [rows]);
  const filtered = view === "outcomes" ? report.resolved : rows;
  const entry = filtered.find((c) => c.id === selected) || filtered[0];
  const pct = report.reported
    ? Math.round((report.hold / report.reported) * 100)
    : 0;
  const csv = () => {
    exportFile(
      "US4C-operational-report.csv",
      [
        [
          "Case reference",
          "Incident",
          "Desk",
          "Location",
          "Status",
          "Priority",
          "Reported INR",
          "On hold INR",
          "Outcome",
        ]
          .map(safeCSV)
          .join(","),
        ...rows.map((c) =>
          [
            c.id,
            c.title,
            missions.find((m) => m.id === c.mission)?.short,
            c.location,
            c.stage === 5 ? "Resolved" : "Active",
            c.priority,
            c.amount,
            c.frozen,
            c.outcome,
          ]
            .map(safeCSV)
            .join(","),
        ),
      ].join("\r\n"),
      "text/csv;charset=utf-8",
    );
    setExported("CSV report exported");
  };
  return (
    <>
      <div className="page-intro">
        <div>
          <span className="eyebrow">US4C / PERFORMANCE & ACCOUNTABILITY</span>
          <h1>Outcomes & reports</h1>
          <p>
            Response outcomes, financial acknowledgements and investigation
            accountability.
          </p>
        </div>
        <div className="report-actions">
          <button className="button" onClick={() => window.print()}>
            <Printer size={16} />
            Print brief
          </button>
          <button className="button primary" onClick={csv}>
            <Download size={16} />
            Export CSV
          </button>
        </div>
      </div>
      <div className="report-filterbar">
        <div>
          <CalendarDays size={17} />
          <strong>Reporting scope</strong>
        </div>
        <label>
          Period
          <select value={range} onChange={(e) => setRange(e.target.value)}>
            <option value="all">All case records</option>
            <option value="1">Last 24 hours</option>
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </label>
        <label>
          Desk
          <select value={mission} onChange={(e) => setMission(e.target.value)}>
            <option value="all">All operational desks</option>
            {missions.map((m) => (
              <option value={m.id} key={m.id}>
                {m.short}
              </option>
            ))}
          </select>
        </label>
        <span>{rows.length} records in scope</span>
      </div>
      <div className="report-kpis">
        <div>
          <span>Cases in scope</span>
          <strong>{rows.length.toString().padStart(2, "0")}</strong>
          <small>{report.active} remain active</small>
        </div>
        <div>
          <span>Resolved / handed over</span>
          <strong>{report.resolved.length.toString().padStart(2, "0")}</strong>
          <small>
            {rows.length
              ? Math.round((report.resolved.length / rows.length) * 100)
              : 0}
            % of records in scope
          </small>
        </div>
        <div>
          <span>Coordination completion</span>
          <strong>
            {report.completed}
            <em> / {report.actions}</em>
          </strong>
          <small>Actions marked completed</small>
        </div>
        <div>
          <span>Funds on hold</span>
          <strong>{money(report.hold)}</strong>
          <small>{pct}% of reported amount</small>
        </div>
      </div>
      <div className="report-layout">
        <ReportSection
          title="Response by operational desk"
          subtitle="WORKLOAD & COMPLETION"
        >
          <div className="chart-legend">
            <i className="legend-active" />
            Active
            <i className="legend-resolved" />
            Resolved / handed over
          </div>
          {missions
            .filter((m) => mission === "all" || mission === m.id)
            .map((m) => {
              const list = rows.filter((c) => c.mission === m.id);
              const complete = list.filter((c) => c.stage === 5).length;
              const max = Math.max(
                1,
                ...missions.map(
                  (d) => rows.filter((c) => c.mission === d.id).length,
                ),
              );
              return (
                <div className="mission-bar-row" key={m.id}>
                  <div>
                    <strong>{m.short}</strong>
                    <span>
                      {complete} resolved / {list.length} total
                    </span>
                  </div>
                  <div className="mission-bar">
                    <i
                      className="bar-active"
                      style={{
                        width: `${((list.length - complete) / max) * 100}%`,
                      }}
                    />
                    <i
                      className="bar-resolved"
                      style={{ width: `${(complete / max) * 100}%` }}
                    />
                  </div>
                  <b>{list.length}</b>
                </div>
              );
            })}
          <div className="report-insight">
            <ShieldCheck size={19} />
            <p>
              <strong>{report.critical} critical active incidents</strong>{" "}
              require continued operator review. Completion uses recorded case
              status and acknowledgement entries.
            </p>
          </div>
        </ReportSection>
        <ReportSection
          title="Financial response"
          subtitle="RECORDED HOLD ACKNOWLEDGEMENTS"
        >
          <div className="hold-summary">
            <div>
              <span>Reported loss</span>
              <strong>{money(report.reported)}</strong>
            </div>
            <div>
              <span>Funds on hold</span>
              <strong>{money(report.hold)}</strong>
            </div>
          </div>
          <div
            className="hold-progress"
            role="img"
            aria-label={`${pct}% of reported funds recorded on hold`}
          >
            <i style={{ width: `${Math.min(100, pct)}%` }} />
          </div>
          <div className="hold-caption">
            <span>{pct}% on hold</span>
            <span>
              {money(Math.max(0, report.reported - report.hold))} to reconcile
            </span>
          </div>
          <div className="financial-breakdown">
            {rows
              .filter((c) => c.amount > 0)
              .map((c) => (
                <NavLink to={`/case/${c.id}`} key={c.id}>
                  <div>
                    <strong>{c.id}</strong>
                    <span>{c.location}</span>
                  </div>
                  <div>
                    <strong>{money(c.frozen)}</strong>
                    <span>of {money(c.amount)}</span>
                  </div>
                  <ArrowRight size={14} />
                </NavLink>
              ))}
          </div>
          <p className="report-footnote">
            Funds on hold are distinct from recovery or refund. Refer to the
            case acknowledgement for the recorded basis.
          </p>
        </ReportSection>
      </div>
      <section className="outcome-register">
        <header>
          <div>
            <span className="eyebrow">CASE RESULTS & CONTINUITY</span>
            <h2>Outcome register</h2>
          </div>
          <div className="report-tabs">
            <button
              className={view === "outcomes" ? "selected" : ""}
              onClick={() => setView("outcomes")}
            >
              Resolved outcomes
            </button>
            <button
              className={view === "all" ? "selected" : ""}
              onClick={() => setView("all")}
            >
              All case results
            </button>
          </div>
        </header>
        <div className="outcome-layout">
          <div className="outcome-list">
            {filtered.map((c) => (
              <button
                key={c.id}
                className={entry?.id === c.id ? "selected" : ""}
                onClick={() => setSelected(c.id)}
              >
                <span className="outcome-mark">
                  <FileText size={19} />
                </span>
                <div>
                  <span className="mono">
                    {c.id} / {c.location}
                  </span>
                  <strong>{c.title}</strong>
                  <p>{c.outcome}</p>
                  <small>
                    {missions.find((m) => m.id === c.mission)?.short} ·{" "}
                    {c.stage === 5 ? "Resolved" : "Active"}
                  </small>
                </div>
                <ArrowRight size={15} />
              </button>
            ))}
            {!filtered.length ? (
              <div className="ops-empty">
                <FileText size={28} />
                <h3>No resolved outcomes in this scope</h3>
                <p>Choose another desk or review all active case results.</p>
              </div>
            ) : null}
          </div>
          {entry ? (
            <aside className="outcome-preview">
              <span className="eyebrow">CASE BRIEF</span>
              <h3>{entry.id}</h3>
              <span
                className={`status-chip ${entry.stage === 5 ? "success" : ""}`}
              >
                {entry.stage === 5
                  ? "Resolved / handed over"
                  : "Investigation active"}
              </span>
              <h4>Recorded outcome</h4>
              <p>{entry.outcome}</p>
              <h4>Responsible unit</h4>
              <p>{entry.unit}</p>
              <h4>Completion & accountability</h4>
              <div className="brief-facts">
                <div>
                  <span>Coordination tasks</span>
                  <strong>
                    {
                      entry.actions.filter((a) => a.status === "Completed")
                        .length
                    }{" "}
                    / {entry.actions.length}
                  </strong>
                </div>
                <div>
                  <span>Evidence references</span>
                  <strong>{entry.evidence.length}</strong>
                </div>
                <div>
                  <span>Operator audit events</span>
                  <strong>{entry.investigation?.audit.length || 0}</strong>
                </div>
              </div>
              <NavLink className="button primary full" to={`/case/${entry.id}`}>
                Review case file
                <ArrowRight size={15} />
              </NavLink>
              <button
                className="button full"
                onClick={() => {
                  exportFile(
                    `${entry.id}-brief.json`,
                    JSON.stringify(entry, null, 2),
                    "application/json",
                  );
                  setExported("Case brief exported");
                }}
              >
                <Download size={15} />
                Export case brief
              </button>
            </aside>
          ) : null}
        </div>
      </section>
      <div className="report-export-footer">
        <span role="status" aria-live="polite">
          {exported ||
            `${report.events} operator audit events in reporting scope`}
        </span>
        <button
          className="text-link"
          onClick={() => {
            exportFile(
              "US4C-audit-register.json",
              JSON.stringify(
                rows.map((c) => ({
                  caseId: c.id,
                  events: c.investigation?.audit || [],
                })),
                null,
                2,
              ),
              "application/json",
            );
            setExported("Audit register exported");
          }}
        >
          <Download size={15} />
          Export audit register
        </button>
      </div>
    </>
  );
}
