# US4C Cyber Command Centre

Professional cyber operations portal repurposed from the original surveillance application. It includes operator login and the original fingerprint launch interaction, a command queue, source intake, four distinct investigation workflows, identity fusion, outcomes, reports and a rate-limited command assistant.

- [Live portal](https://thevikram123.github.io/us4c-command-centre/)
- [Assistant health](https://us4c-command-assistant.thevikram123.workers.dev/health)
- Supabase project: `ryddbjuaqehelgycodxs`, Mumbai.

## Operator workflows

The original `WatchlistFlow.tsx` provided intake, fusion query, entity resolution, de-duplication, canonical locking, watchlist publication, search, verification, correlation, analytics, GIS, command and resolution controls. The repurposed workflow preserves those operator decisions and substitutes financial and digital evidence for surveillance frames.

Four visible phases contain twelve stages per mission:

| Mission                        | Investigation and response stages after identity fusion                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------- |
| Financial fraud                | Transaction search, evidence verification, money trail, risk assessment, jurisdiction review, financial coordination, resolution            |
| Women and child online safety  | Evidence search, threat verification, account correlation, protection assessment, location review, protection coordination, resolution      |
| Harmful-content review         | Content search, context verification, propagation analysis, classification review, geographic context, platform coordination, resolution    |
| Emergency and welfare response | Location evidence, urgency verification, contact correlation, response assessment, location confirmation, resource coordination, resolution |

Every mission starts with intake, fusion query, entity resolution, de-duplication and reviewed intelligence publication. Operators select candidate records, inspect agreement/conflict explanations, split records, choose and lock a canonical source with a reason, retain aliases and provenance, verify or reject evidence, complete mission-specific checks, and record task acknowledgements and handover references. Urgent protection review can be initiated before identity fusion is complete.

Entity linkage uses exact normalized primary identifiers and identifier types. Display-name matches alone never merge records. Source-quality scores are analyst inputs, not calibrated identity probabilities. New cases start with no invented source records and support documented manual or JSON imports.

## Sources and reports

The source workspace contains detailed training social-post archives, helpline transcripts, citizen complaints, financial acknowledgements, emergency referrals, internal referrals and telecom-response metadata. Operators inspect source provenance and identifiers, create incidents or link records to existing incidents. API connectors are explicitly unconnected; this is not a live social-media monitor or an agency integration.

Reports derive their metrics from scoped case records and actions. They distinguish funds on hold from recovered/refunded money, support period/desk filters, show a selectable outcome brief, and export CSV, case JSON and audit registers. The public workspace has eight fictional training cases with masked identifiers and a single persistent environment banner. Training edits stay local; authenticated cases are stored privately.

## Database and audit

`database/schema.sql` defines private owner-based cases and read-only public training records. `database/seed.sql` contains the eight training records. `database/audit.sql` defines the server audit table and trigger.

The server records the authenticated actor, timestamp, case reference, changed payload fields and operator note for private case mutations. Browser clients can only read their own audit events: insert, update and delete privileges are revoked. Actor identity comes from `auth.uid()`, not a browser-supplied actor label. Rolled-back SQL checks verified the actor, cross-account isolation and write restrictions; no QA users remain. The security advisor reports no findings.

Operator signup provides a personal private workspace and requires email confirmation. Institutional roles, multi-user agency teams, media storage and evidentiary chain of custody require additional implementation. The fingerprint is the retained launch interaction; device biometric authentication is not implemented.

## Assistant

The browser calls the Cloudflare Worker; the Worker calls Groq using the existing `GROQ_API_KEY` Secrets Store binding. The key never enters frontend source or bundles. The model is `openai/gpt-oss-20b`, with output bounded to 1,000 tokens, ten messages, 3,000 characters per message, 12,000 total characters and bounded request/response bodies.

Limits are ten requests/minute per verified operator or public visitor, thirty/minute per IP, and forty/minute for the shared provider budget. Cloudflare applies these per location; they are not strict global quotas. Private context uses a validated Supabase session and row-level security. Public context uses server-controlled training records. The assistant cannot freeze funds, dispatch resources, access external agency databases, or make enforcement decisions.

## Development and deployment

Use Node.js 22 or newer. Copy `.env.example` to `.env.local` and configure the public Supabase URL/key and Worker URL.

```powershell
npm.cmd ci
npm.cmd run dev
npm.cmd run typecheck
npm.cmd run lint
npm.cmd test
npm.cmd run build
```

The main branch deploys to GitHub Pages through `.github/workflows/pages.yml`; hash routing and the repository base path preserve nested routes. Secret values must never be added to frontend variables.

For every Worker command, use the isolated profile and verify account `85988b5545b4331d02625c8e2a9f3d52` before mutation:

```powershell
$env:XDG_CONFIG_HOME = "$PWD\.cloudflare-correct-profile"
npm.cmd exec wrangler -- whoami
npm.cmd exec wrangler -- deploy --dry-run --env-file .env.worker
npm.cmd exec wrangler -- deploy --env-file .env.worker
```

Validation covers identifier normalization and alias-only separation, canonical provenance, review gates, task references and closure, chatbot trust boundaries, all four complete browser workflows, local persistence, source triage, exports, login and mobile layout. `DESIGN.md` records the design decisions.

References: user-provided `c4i.jpeg`, `use cases guidance.md`, organizational framework image and S4C gazette PDF; [Cloudflare rate-limit bindings](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/); [Supabase row-level security](https://supabase.com/docs/guides/database/postgres/row-level-security).
