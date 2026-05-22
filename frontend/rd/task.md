# SchemeLens Frontend Implementation Plan & Task List

## Sprint 1: Authentication & Profile Sync (Clerk + Supabase)
- [x] Initialize Clerk authentication in root `app/layout.js`
- [x] Implement passwordless email OTP verification flow
- [x] Implement Google Login flow
- [x] Set up Supabase DB integration with triggers to sync Clerk user profiles on initial login
- [x] Create persistent User Profile dashboard inside user preferences

## Sprint 2: Next-Gen Citizen Main Dashboard (Search & Recommendations)
- [x] Build modernized layout with Announcement Banner, animated Hero section, and PixelDecoration elements
- [x] Implement optimized prompt text area with responsive quick chips triggers
- [x] Add the `top_k` dropdown limit selector `[3, 5, 10, 15, 20]`
- [x] Build search execution engine with search type toggles:
  - [x] **Normal Search**: connect to `POST /api/recommend`
  - [x] **Smart Search**: connect to `POST /api/recommend/premium` with collapsible "AI Enhancement Details" panel
- [x] Refactor `SchemeCard` component:
  - [x] Render all matching attributes (title, category badge, tags, description text, link button)
  - [x] Integrate user feedback star rating widget linked to `POST /api/rate`

## Sprint 3: Government Risk Dashboard & LangChain Policy Sandbox
- [x] Build top-level government analytics stats deck (`GET /api/gov/risk-summary`)
- [x] Build aggregated categories tabular views highlighting extreme policy friction risks
- [x] Implement Top Risky Schemes browser with sliders to control `min_risk` levels and search categories
- [x] Build **Interactive Custom Risk Prompt Sandbox**:
  - [x] Text area input for custom government criteria ("Find schemes that encourage water waste...")
  - [x] Weights adjusters for custom risk parameters
  - [x] Interactive query button that parses requests via server-side LangChain workflows

## Sprint 4: "Get Delivered" Omnichannel Integration
- [x] Design central delivery preferences control board
- [x] Implement WhatsApp Business/Twilio subscription flow
- [x] Implement Telegram Bot `@SchemeLensBot` interactive verification
- [x] Implement Email Newsletter dynamic triggers
- [x] Add n8n webhook connector script (`utils/delivery.js`) to sync matched scheme profiles on-demand

## Sprint 5: Developer API Console & Quotas
- [x] Set up interactive Swagger OpenAPI UI component inside `/about` or `/developer` route
- [x] Build Clerk-backed API key generator dashboard with client client secrets saved to Supabase
- [x] Add visual analytics trackers for developers to monitor request volumes

## Sprint 6: Quality, Polishing & Verification
- [x] Implement full visual quality assurance (6px border-radius buttons, 12px cards, micro-animations, theme tokens)
- [x] Verify loading skeletons work flawlessly on slow database connections
- [x] Ensure 100% responsiveness on mobile (375px), tablets (768px), and high-res desktops (1280px)
