import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  CheckCircle2,
  FileClock,
  GitBranch,
  MessageSquare,
  Plus,
  Search,
  ShieldCheck,
  Wallet,
} from "lucide-react";
import { type Case, missions, money } from "./data";
import { flowSteps } from "./investigation";
const missionIcons = {
  fraud: Wallet,
  safety: ShieldCheck,
  content: GitBranch,
  distress: Activity,
};
export default function CommandDashboard({
  cases,
  openChat,
}: {
  cases: Case[];
  openChat: () => void;
}) {
  const [mission, setMission] = useState("all");
  const [view, setView] = useState("active");
  const [query, setQuery] = useState("");
  const active = cases.filter((c) => c.stage < 5);
  const list = cases
    .filter(
      (c) =>
        (mission === "all" || c.mission === mission) &&
        (view === "all" ||
          (view === "active"
            ? c.stage < 5
            : view === "critical"
              ? c.priority === "Critical" && c.stage < 5
              : c.stage === 5)) &&
        `${c.id} ${c.title} ${c.location} ${c.source}`
          .toLowerCase()
          .includes(query.toLowerCase()),
    )
    .sort(
      (a, b) =>
        Number(b.priority === "Critical") - Number(a.priority === "Critical"),
    );
  const pending = active
    .flatMap((c) => c.actions)
    .filter((a) => a.status !== "Completed").length;
  const places = [...new Set(active.map((c) => c.location))];
  return (
    <>
      <div className="page-intro">
        <div>
          <span className="eyebrow">US4C / OPERATIONS</span>
          <h1>Command centre</h1>
          <p>
            Incident triage, investigation progress and response coordination.
          </p>
        </div>
        <NavLink className="button primary" to="/intake">
          <Plus size={16} />
          Register incident
        </NavLink>
      </div>
      <div className="command-kpis">
        <button
          onClick={() => setView("active")}
          className={view === "active" ? "selected" : ""}
        >
          <FileClock size={21} />
          <span>Active incidents</span>
          <strong>{active.length.toString().padStart(2, "0")}</strong>
          <small>{missions.length} operational desks</small>
        </button>
        <button
          onClick={() => setView("critical")}
          className={view === "critical" ? "selected" : ""}
        >
          <Activity size={21} />
          <span>Critical priority</span>
          <strong>
            {active
              .filter((c) => c.priority === "Critical")
              .length.toString()
              .padStart(2, "0")}
          </strong>
          <small>Review and protection decisions</small>
        </button>
        <NavLink to="/reports">
          <Wallet size={21} />
          <span>Funds on hold</span>
          <strong>{money(cases.reduce((sum, c) => sum + c.frozen, 0))}</strong>
          <small>
            {money(cases.reduce((sum, c) => sum + c.amount, 0))} reported
          </small>
        </NavLink>
        <button
          onClick={() => setView("resolved")}
          className={view === "resolved" ? "selected" : ""}
        >
          <CheckCircle2 size={21} />
          <span>Resolved / handed over</span>
          <strong>
            {cases
              .filter((c) => c.stage === 5)
              .length.toString()
              .padStart(2, "0")}
          </strong>
          <small>Outcome and follow-up recorded</small>
        </button>
      </div>
      <div className="desk-strip">
        {missions.map((m) => {
          const Icon = missionIcons[m.id];
          const items = active.filter((c) => c.mission === m.id);
          return (
            <NavLink
              to={`/mission/${m.id}`}
              className={`desk-tile ${m.id}`}
              key={m.id}
            >
              <Icon size={21} />
              <div>
                <strong>{m.short}</strong>
                <span>
                  {items.length} active ·{" "}
                  {items.filter((c) => c.priority === "Critical").length}{" "}
                  critical
                </span>
              </div>
              <ArrowUpRight size={16} />
            </NavLink>
          );
        })}
      </div>
      <div className="command-layout">
        <section className="command-register">
          <header>
            <div>
              <span className="eyebrow">OPERATOR QUEUE</span>
              <h2>Incidents requiring action</h2>
            </div>
            <NavLink to="/cases" className="text-link">
              Case register
              <ArrowRight size={15} />
            </NavLink>
          </header>
          <div className="register-toolbar">
            <label className="register-search">
              <Search size={16} />
              <input
                aria-label="Search incident queue"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search incident, reference or location…"
              />
            </label>
            <select
              aria-label="Filter mission desk"
              value={mission}
              onChange={(e) => setMission(e.target.value)}
            >
              <option value="all">All desks</option>
              {missions.map((m) => (
                <option value={m.id} key={m.id}>
                  {m.short}
                </option>
              ))}
            </select>
          </div>
          <div className="register-tabs">
            {[
              ["active", "Active"],
              ["critical", "Critical"],
              ["resolved", "Resolved"],
              ["all", "All incidents"],
            ].map(([id, label]) => (
              <button
                key={id}
                className={view === id ? "selected" : ""}
                onClick={() => setView(id)}
              >
                {label}
              </button>
            ))}
            <span>{list.length} records</span>
          </div>
          <div className="register-scroll">
            <table className="incident-table">
              <thead>
                <tr>
                  <th>Incident / source</th>
                  <th>Priority</th>
                  <th>Investigation stage</th>
                  <th>Next operator action</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <NavLink to={`/case/${c.id}`}>
                        <span className="mono">{c.id}</span>
                        <strong>{c.title}</strong>
                        <small>
                          {c.location} · {c.source}
                        </small>
                      </NavLink>
                    </td>
                    <td>
                      <span
                        className={`status-chip ${c.priority === "Critical" ? "critical" : ""}`}
                      >
                        {c.priority}
                      </span>
                    </td>
                    <td>
                      <strong>
                        {c.stage === 5
                          ? "Resolved"
                          : flowSteps[c.mission][c.investigation?.step || 0]}
                      </strong>
                      <div
                        className="progress-segments"
                        aria-label={`${c.investigation?.completed.length || 0} of 12 stages reviewed`}
                      >
                        {Array.from({ length: 12 }, (_, i) => (
                          <i
                            key={i}
                            className={
                              c.stage === 5 ||
                              i < (c.investigation?.completed.length || 0)
                                ? "done"
                                : ""
                            }
                          />
                        ))}
                      </div>
                      <small>
                        {c.stage === 5
                          ? "Handover recorded"
                          : `${c.investigation?.completed.length || 0}/12 stages reviewed`}
                      </small>
                    </td>
                    <td className="next-action">
                      {c.stage === 5
                        ? c.outcome
                        : c.investigation?.step === 3
                          ? "Review duplicates and lock canonical profile"
                          : c.actions.find((a) => a.status !== "Completed")
                              ?.task || "Review intake and source evidence"}
                    </td>
                    <td>
                      <NavLink className="button compact" to={`/case/${c.id}`}>
                        Open
                        <ArrowRight size={14} />
                      </NavLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!list.length ? (
              <div className="ops-empty">
                <Search size={25} />
                <h3>No matching incidents</h3>
                <p>Adjust the queue filters or register a new incident.</p>
              </div>
            ) : null}
          </div>
          <footer>
            <span>
              {pending} coordination actions outstanding across active incidents
            </span>
            <NavLink to="/reports">
              View response outcomes
              <ArrowRight size={14} />
            </NavLink>
          </footer>
        </section>
        <aside className="command-side">
          <section>
            <span className="eyebrow">REVIEW GATES</span>
            <h3>Operator decisions</h3>
            {[
              {
                label: "Identity resolution",
                count: active.filter((c) => !c.investigation?.locked).length,
                color: "cyan",
              },
              {
                label: "Evidence verification",
                count: active.filter(
                  (c) =>
                    Object.keys(c.investigation?.evidenceDecision || {})
                      .length < c.evidence.length,
                ).length,
                color: "amber",
              },
              {
                label: "Coordination follow-up",
                count: active.filter((c) =>
                  c.actions.some((a) => a.status !== "Completed"),
                ).length,
                color: "coral",
              },
            ].map((g) => (
              <div className="gate-row" key={g.label}>
                <i className={`gate-dot ${g.color}`} />
                <span>{g.label}</span>
                <strong>{g.count}</strong>
              </div>
            ))}
            <p className="side-caption">
              Counts reflect unfinished reviews in the current case register.
            </p>
          </section>
          <section>
            <span className="eyebrow">JURISDICTION WORKLOAD</span>
            <h3>Active case distribution</h3>
            {places.map((place) => (
              <div className="locality-row" key={place}>
                <span>{place}</span>
                <i>
                  <b
                    style={{
                      width: `${(active.filter((c) => c.location === place).length / Math.max(1, active.length)) * 100}%`,
                    }}
                  />
                </i>
                <strong>
                  {active.filter((c) => c.location === place).length}
                </strong>
              </div>
            ))}
          </section>
          <section className="command-assistant-box">
            <MessageSquare size={25} />
            <h3>Command assistant</h3>
            <p>
              Review source findings, prepare investigation briefs and draft
              coordination notes.
            </p>
            <button className="button full" onClick={openChat}>
              <MessageSquare size={16} />
              Open assistant
            </button>
          </section>
          <NavLink className="command-fusion-link" to="/fusion">
            <GitBranch size={20} />
            <div>
              <strong>Data fusion workspace</strong>
              <span>Sources, resolution and provenance</span>
            </div>
            <ArrowRight size={16} />
          </NavLink>
        </aside>
      </div>
    </>
  );
}
