# US4C portal design

This is an operator portal for complaint triage, cyber investigation and response coordination. The interface prioritises the next operator decision and its source evidence. Marketing layouts, cinematic motion and decorative surveillance feeds do not fit this brief.

The navy foundation comes from the original application. The user explicitly requested additional colours: blue identifies financial investigation and intake, violet identifies online protection and identity fusion, orange identifies content review and investigation assessment, rose identifies emergencies, and mint identifies verified decisions and completed outcomes. Text and icons accompany every colour distinction.

Use four visible investigation phases with the current phase's individual stages underneath. Keep all twelve stages and their review gates; show the case-control sidebar on demand. A decision requires an explicit action, a source reference or a review reason. Source quality is an analyst-assigned record score, not an identity-match probability.

The command centre uses an incident register, review-gate counts and jurisdiction workload derived from records. Outcomes and reports use scoped totals, labelled comparison bars, financial acknowledgements and a selectable case brief. Do not invent activity charts, external API connectivity, recovery outcomes or agency dispatches.

Retain the original fingerprint launch interaction and login entry. The fingerprint illustration is not device biometric authentication. Account authentication uses Supabase. Private case audit events originate in the database; exercise history remains local.

Components use the existing React and CSS stack. Investigation state is lifted into a provider with explicit state/actions and composed stage components. Heavy route modules and the assistant are lazy-loaded. Respect reduced motion, keyboard focus, labelled form controls, narrow viewports and real loading/error/empty states.

Design guidance applied: design-taste-frontend, redesign-existing-projects, frontend-design-codex, relevant typography and surface guidance from high-end-visual-design and minimalist-ui, dense-grid guidance from industrial-brutalist-ui, vercel-react-best-practices, vercel-composition-patterns, and web-design-guidelines. Public-sector usability and the user's explicit colour direction take precedence over conflicting aesthetic defaults.
