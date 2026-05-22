# SchemeLens Frontend Implementation Plan & Task List

## Sprint 1: Authentication & Profile Sync (Clerk + Supabase)
- [x] Initialize Clerk authentication in root `app/layout.js`
- [x] Implement passwordless email OTP verification flow
- [x] Implement Google Login flow
- [x] Set up Supabase DB integration with triggers to sync Clerk user profiles on initial login
- [x] Create persistent User Profile dashboard inside user preferences

## Sprint 2: Next-Gen Citizen Main Dashboard (Search & Recommendations)
- [ ] Build modernized layout with Announcement Banner, animated Hero section, and PixelDecoration elements
- [ ] Implement optimized prompt text area with responsive quick chips triggers
- [ ] Add the `top_k` dropdown limit selector `[3, 5, 10, 15, 20]`
- [ ] Build search execution engine with search type toggles:
  - [ ] **Normal Search**: connect to `POST /api/recommend`
  - [ ] **Smart Search**: connect to `POST /api/recommend/premium` with collapsible "AI Enhancement Details" panel
- [ ] Refactor `SchemeCard` component:
  - [ ] Render all matching attributes (title, category badge, tags, description text, link button)
  - [ ] Integrate user feedback star rating widget linked to `POST /api/rate`

## Sprint 3: Government Risk Dashboard & LangChain Policy Sandbox
- [ ] Build top-level government analytics stats deck (`GET /api/gov/risk-summary`)
- [ ] Build aggregated categories tabular views highlighting extreme policy friction risks
- [ ] Implement Top Risky Schemes browser with sliders to control `min_risk` levels and search categories
- [ ] Build **Interactive Custom Risk Prompt Sandbox**:
  - [ ] Text area input for custom government criteria ("Find schemes that encourage water waste...")
  - [ ] Weights adjusters for custom risk parameters
  - [ ] Interactive query button that parses requests via server-side LangChain workflows

## Sprint 4: "Get Delivered" Omnichannel Integration
- [ ] Design central delivery preferences control board
- [ ] Implement WhatsApp Business/Twilio subscription flow
- [ ] Implement Telegram Bot `@SchemeLensBot` interactive verification
- [ ] Implement Email Newsletter dynamic triggers
- [ ] Add n8n webhook connector script (`utils/delivery.js`) to sync matched scheme profiles on-demand

## Sprint 5: Developer API Console & Quotas
- [ ] Set up interactive Swagger OpenAPI UI component inside `/about` or `/developer` route
- [ ] Build Clerk-backed API key generator dashboard with client client secrets saved to Supabase
- [ ] Add visual analytics trackers for developers to monitor request volumes

## Sprint 6: Quality, Polishing & Verification
- [ ] Implement full visual quality assurance (6px border-radius buttons, 12px cards, micro-animations, theme tokens)
- [ ] Verify loading skeletons work flawlessly on slow database connections
- [ ] Ensure 100% responsiveness on mobile (375px), tablets (768px), and high-res desktops (1280px)
