# US4C Cyber Command Centre

State-neutral cyber command and coordination workspace, repurposed from the original surveillance app. Retains the original dark navy/cyan palette and database-fusion investigation sequence. The public site contains explicitly synthetic examples; camera feeds, facial-recognition queues and surveillance statistics are absent from the active app.

## Services

- Frontend: https://thevikram123.github.io/us4c-command-centre/
- Chatbot Worker: https://us4c-command-assistant.thevikram123.workers.dev
- Supabase: project `ryddbjuaqehelgycodxs` in Mumbai.

## Workflows

Financial fraud response; women and child online safety; harmful-content analyst review; digital distress and welfare coordination. Each case has a common Report -> Analyse -> Verify -> Coordinate -> Respond -> Resolve workflow, source-aware AI insights, evidence metadata, relationship exploration, coordination records, timeline and outcome.

The retained investigation pipeline is Detection -> Correlation -> DB Fusion -> Entity profile -> AI summary -> GIS view -> Command review -> Response -> Resolution. Database fusion retains CCTNS, NCRB, ICJS, e-Courts, SARATHI and VAHAN, with financial, telecom and open-source inputs. It performs actual identifier matching over cases accessible in the current workspace. External government, telecom and bank connectors are explicitly unconfigured.

Source ingestion preserves direct APIs, web crawling, ad hoc request portals/web services, one-time imports with incremental updates, and scanning/OCR/translation/archiving. These are integration design stages; no external crawling or live data ingestion is performed.

Functional units follow the US4C reference image, with forensic support, cybersecurity response, supervisory review, awareness and capacity building informed by the supplied gazette. State-specific names, staffing numbers, legal thresholds and jurisdiction rules are not adopted.

## Database and identity

Public examples are read from Supabase and are read-only in the database. Public demo edits and registrations stay in browser local storage. Operator sign-in opens a separate private workspace backed by Supabase. Row-level policies allow each authenticated user to access only their own cases; demo records remain readable. Sign up through the app and confirm the email before signing in. Open sign-up provides personal workspaces, not privileged institutional membership.

The schema is in `database/schema.sql`. It was applied to the dedicated project. `database/seed.sql` records the four synthetic examples. RLS verification tested cross-user reads and updates, plus owner updates, in a rolled-back transaction. No QA users were retained. Evidence is metadata only; actual media upload, immutable chain of custody, multi-user institutional teams and agency integrations require additional implementation.

## Chatbot

The browser calls Cloudflare; Cloudflare calls Groq. `GROQ_API_KEY` stays in the existing Cloudflare Secrets Store. The Worker uses `openai/gpt-oss-20b`, limits output to 1,000 tokens, accepts at most 10 messages of 3,000 characters each (12,000 total), bounds request and response bodies, and sanitizes failures.

Three independent Cloudflare rate-limit bindings apply: 10 requests/minute per verified operator or public demo IP; 30 requests/minute per IP for abuse protection; 40 requests/minute for the shared provider budget. These are per Cloudflare location, not strict global quotas. Public users get server-controlled synthetic context; authenticated users get case context fetched with their validated Supabase session and RLS. The assistant drafts and explains; it cannot freeze funds, dispatch resources, contact agencies or decide enforcement.

## Local development

Use Node.js 22 or newer:

```powershell
npm.cmd ci
Copy-Item .env.example .env.local
# Set the public project URL/key and Worker URL in .env.local.
npm.cmd run dev
npm.cmd test
npm.cmd run build
```

GitHub Pages uses hash routing and the repository base path so nested links work after refresh. `.github/workflows/pages.yml` builds and deploys on main. Public Supabase settings are configured in the workflow; the Worker URL is the repository variable `VITE_CHATBOT_URL`. No provider or service-role secrets belong in frontend settings.

## Worker deployment

```powershell
$env:XDG_CONFIG_HOME = "$PWD\.cloudflare-correct-profile"
npm.cmd exec wrangler -- whoami
npm.cmd exec wrangler -- types
npm.cmd exec wrangler -- deploy --dry-run
npm.cmd exec wrangler -- deploy
```

Verify account `85988b5545b4331d02625c8e2a9f3d52` before mutations. Use the existing secret binding metadata in `wrangler.jsonc`; do not retrieve or print the secret value. `/health` exposes service metadata only. CORS restricts browser origins, while private case access independently requires a verified Supabase session.

References used: the user-supplied `c4i.jpeg`, `use cases guidance.md` and S4C gazette PDF. Cloudflare binding behavior follows https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/ and Supabase access follows https://supabase.com/docs/guides/database/postgres/row-level-security.
