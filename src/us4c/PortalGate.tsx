import { useEffect, useRef, useState } from "react";
import {
  Activity,
  ArrowRight,
  Check,
  Fingerprint,
  GitBranch,
  KeyRound,
  Loader2,
  LockKeyhole,
  Shield,
  ShieldCheck,
  User,
  Wallet,
} from "lucide-react";
import { database } from "./store";
export default function PortalGate({
  onEnter,
  onCancel,
}: {
  onEnter: () => void;
  onCancel?: () => void;
}) {
  const [phase, setPhase] = useState<"launch" | "checking" | "ready" | "login">(
    "launch",
  );
  const [checks, setChecks] = useState<{ name: string; status: string }[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState<"demo" | "signin" | "signup">("demo");
  const alive = useRef(true);
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);
  async function launch() {
    setPhase("checking");
    setChecks([
      { name: "Workspace configuration", status: "Checking" },
      { name: "Operator session", status: "Checking" },
      { name: "Case database", status: "Checking" },
    ]);
    const update = (index: number, status: string) => {
      if (alive.current)
        setChecks((current) =>
          current.map((c, i) => (i === index ? { ...c, status } : c)),
        );
    };
    update(0, database ? "Configured" : "Training mode");
    await Promise.all([
      database?.auth
        .getSession()
        .then(({ data }) =>
          update(
            1,
            data.session ? "Session available" : "Account sign-in available",
          ),
        )
        .catch(() => update(1, "Sign-in check unavailable")),
      database
        ?.from("us4c_cases")
        .select("id")
        .limit(1)
        .then(({ error }) =>
          update(2, error ? "Connection needs review" : "Connection verified"),
        ),
    ]);
    if (alive.current) setPhase("ready");
  }
  return (
    <div className="portal-gate">
      <div className="portal-top">
        <div>
          <Shield size={22} />
          <strong>US4C</strong>
          <span>Cyber command & control</span>
        </div>
        <span>
          <LockKeyhole size={13} />
          Operator access
        </span>
      </div>
      <div className="portal-layout">
        <section className="portal-identity">
          <div className="portal-emblem">
            <Shield size={58} />
            <div className="portal-emblem-ring" />
          </div>
          <span className="eyebrow">UNIFIED CYBER OPERATIONS</span>
          <h1>US4C</h1>
          <p className="portal-subtitle">Integrated Cyber Command & Control</p>
          <p className="portal-description">
            Complaint monitoring, intelligence fusion, investigation and
            coordinated response.
          </p>
          <div className="portal-missions">
            {[
              { Icon: Wallet, label: "Financial fraud", className: "fraud" },
              {
                Icon: ShieldCheck,
                label: "Online safety",
                className: "safety",
              },
              {
                Icon: GitBranch,
                label: "Content intelligence",
                className: "content",
              },
              {
                Icon: Activity,
                label: "Emergency response",
                className: "distress",
              },
            ].map(({ Icon, label, className }) => (
              <div className={className} key={label}>
                <Icon size={21} />
                <span>{label}</span>
              </div>
            ))}
          </div>
          <div className="portal-security">
            <ShieldCheck size={18} />
            <span>
              Private case access uses your authenticated operator account.
            </span>
          </div>
        </section>
        <section className="portal-access-card">
          <span className="eyebrow">US4C PORTAL ACCESS</span>
          {phase === "launch" ? (
            <>
              <h2>Enter the command centre</h2>
              <p>
                Launch the workspace and verify its connection before entering.
              </p>
              <button
                className="fingerprint-launch"
                onClick={() => void launch()}
              >
                <span className="fingerprint-target">
                  <Fingerprint size={66} />
                  <i />
                  <b />
                </span>
                <strong>Launch portal</strong>
                <span>
                  Workspace access check
                  <ArrowRight size={15} />
                </span>
              </button>
              <div className="portal-access-divider">
                <span>or use your account</span>
              </div>
              <button
                className="button primary full"
                onClick={() => {
                  setMode("demo");
                  setPhase("login");
                  setError("");
                }}
              >
                <User size={16} />
                Demo sign in
                <ArrowRight size={15} />
              </button>
              <button
                className="button full"
                onClick={() => {
                  setMode("signin");
                  setPhase("login");
                  setError("");
                }}
              >
                <KeyRound size={16} />
                Operator sign in
              </button>
            </>
          ) : null}
          {phase === "checking" || phase === "ready" ? (
            <>
              <div
                className={`fingerprint-status ${phase === "checking" ? "scanning" : "verified"}`}
              >
                <Fingerprint size={51} />
                {phase === "ready" ? (
                  <span>
                    <Check size={14} />
                  </span>
                ) : null}
              </div>
              <h2>
                {phase === "checking"
                  ? "Checking workspace…"
                  : "Workspace ready"}
              </h2>
              <p>
                {phase === "checking"
                  ? "Verifying configuration, session and database access."
                  : "Choose private operator access or enter the training workspace."}
              </p>
              <div className="portal-checks">
                {checks.map((c) => (
                  <div key={c.name}>
                    <span>{c.name}</span>
                    <strong>
                      {c.status === "Checking" ? (
                        <Loader2 size={13} className="spin" />
                      ) : (
                        <Check size={13} />
                      )}{" "}
                      {c.status}
                    </strong>
                  </div>
                ))}
              </div>
              {phase === "ready" ? (
                <>
                  <button
                    className="button primary full"
                    onClick={() => {
                      setMode("demo");
                      setPhase("login");
                      setError("");
                    }}
                  >
                    <KeyRound size={16} />
                    Demo sign in
                    <ArrowRight size={15} />
                  </button>
                  <button
                    className="button full"
                    onClick={() => {
                      setMode("signin");
                      setPhase("login");
                      setError("");
                    }}
                  >
                    <KeyRound size={16} />
                    Operator sign in
                  </button>
                  <button className="training-enter" onClick={onEnter}>
                    Enter training workspace
                    <ArrowRight size={15} />
                  </button>
                </>
              ) : null}
            </>
          ) : null}
          {phase === "login" ? (
            <>
              <div className="portal-login-heading">
                <Fingerprint size={36} />
                <LockKeyhole size={16} />
              </div>
              <h2>
                {mode === "demo"
                  ? "Demo sign in"
                  : mode === "signin"
                    ? "Operator sign in"
                    : "Create operator account"}
              </h2>
              <p>
                {mode === "demo"
                  ? "Enter the populated US4C training workspace."
                  : "Authenticate to access your private US4C case workspace."}
              </p>
              <form
                key={mode}
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError("");
                  const form = new FormData(e.currentTarget);
                  if (mode === "demo") {
                    if (
                      String(form.get("username")).trim() === "us4c.operator" &&
                      String(form.get("password")) === "gildemo"
                    )
                      onEnter();
                    else
                      setError(
                        "Enter the demo username us4c.operator and password gildemo.",
                      );
                    return;
                  }
                  if (!database) {
                    setError(
                      "The case database is not configured. Use the training workspace.",
                    );
                    return;
                  }
                  setBusy(true);
                  setError("");
                  const credentials = {
                    email: String(form.get("email")).trim(),
                    password: String(form.get("password")),
                  };
                  try {
                    const { data, error } =
                      mode === "signin"
                        ? await database.auth.signInWithPassword(credentials)
                        : await database.auth.signUp(credentials);
                    if (error) throw error;
                    if (data.session) onEnter();
                    else
                      setError(
                        "Check your email to confirm your account, then sign in.",
                      );
                  } catch (e) {
                    setError((e as Error).message);
                  } finally {
                    if (alive.current) setBusy(false);
                  }
                }}
              >
                <label>
                  {mode === "demo" ? "Username" : "Operator email"}
                  <div className="portal-input">
                    <User size={16} />
                    <input
                      name={mode === "demo" ? "username" : "email"}
                      type={mode === "demo" ? "text" : "email"}
                      defaultValue={mode === "demo" ? "us4c.operator" : ""}
                      required
                      autoComplete={mode === "demo" ? "username" : "email"}
                      placeholder={
                        mode === "demo"
                          ? "us4c.operator"
                          : "operator@organisation.gov.in…"
                      }
                    />
                  </div>
                </label>
                <label>
                  Password
                  <div className="portal-input">
                    <KeyRound size={16} />
                    <input
                      name="password"
                      type="password"
                      minLength={mode === "signup" ? 8 : undefined}
                      defaultValue={mode === "demo" ? "gildemo" : ""}
                      required
                      autoComplete={
                        mode === "signup" ? "new-password" : "current-password"
                      }
                      placeholder="Enter your password…"
                    />
                  </div>
                </label>
                <button className="button primary full" disabled={busy}>
                  {busy ? (
                    <Loader2 size={16} className="spin" />
                  ) : (
                    <LockKeyhole size={16} />
                  )}{" "}
                  {busy
                    ? "Signing in…"
                    : mode === "demo"
                      ? "Sign in to demo"
                      : mode === "signin"
                        ? "Sign in to US4C"
                        : "Create account"}
                  <ArrowRight size={15} />
                </button>
              </form>
              {mode === "demo" ? (
                <small className="portal-demo-credentials">
                  Demo access: us4c.operator · gildemo. Changes stay in this
                  browser.
                </small>
              ) : null}
              {error ? (
                <p role="status" className="portal-error">
                  {error}
                </p>
              ) : null}
              <button
                className="text-link"
                onClick={() => {
                  setMode(
                    mode === "demo"
                      ? "signin"
                      : mode === "signin"
                        ? "signup"
                        : "signin",
                  );
                  setError("");
                }}
              >
                {mode === "demo"
                  ? "Use a private operator account"
                  : mode === "signin"
                    ? "Create an operator account"
                    : "Return to sign in"}
                <ArrowRight size={14} />
              </button>
              {mode !== "demo" ? (
                <button
                  className="text-link"
                  onClick={() => {
                    setMode("demo");
                    setError("");
                  }}
                >
                  Use demo credentials
                  <ArrowRight size={14} />
                </button>
              ) : null}
              <div className="portal-access-divider">
                <span>training access</span>
              </div>
              <button className="training-enter" onClick={onEnter}>
                Enter training workspace
                <ArrowRight size={15} />
              </button>
            </>
          ) : null}
          {onCancel ? (
            <button className="portal-return" onClick={onCancel}>
              Return to current workspace
            </button>
          ) : null}
          <div className="portal-account-note">
            <LockKeyhole size={13} />
            <span>
              Fingerprint launch interaction retained. Private access requires
              account sign-in.
            </span>
          </div>
        </section>
      </div>
      <div className="portal-footer">
        <span>US4C · Unified Cyber Command & Control</span>
        <span>Intelligence · Investigation · Response</span>
      </div>
    </div>
  );
}
