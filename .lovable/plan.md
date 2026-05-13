## Root cause of the broken button

`src/routes/request.tsx` is a layout route that renders only `<RequestProvider><Outlet/></RequestProvider>`. There is no `src/routes/request.index.tsx`, so navigating to `/request` matches the layout but renders nothing — the page appears blank/broken when "Request blood" is clicked from the Hero.

Today's flow also jumps Hero → `/request/blood` (a form) with no onboarding, no review step, no submitted screen, and the progress tracker is hard-coded to 3 steps.

## New flow (8 screens)

```
/request                  Step 0 — Emergency intro (new, fixes the bug)
/request/blood            Step 1 — Blood requirement (existing, retune progress)
/request/hospital         Step 2 — Hospital info (existing, retune progress)
/request/proof            Step 3 — Medical proof (existing, retune progress)
/request/review           Step 4 — Review & confirm (NEW)
/request/submitted        Step 5 — Submitted + verification timeline (NEW;
                                   creates the DB row, shows request ID,
                                   then auto-advances to matching)
/request/matching         Step 6 — Live donor matching (existing, polish)
/request/confirmed        Step 7 — Donor confirmed (existing)
/request/completed        Closing screen (existing)
```

`request/verifying.tsx` is replaced by `request/submitted.tsx` (same DB-insert logic, richer operational UI). Hero "Request blood" CTA now points to `/request` (the intro), not `/request/blood`.

## Files to add

- `src/routes/request.index.tsx` — Emergency Introduction screen
  - Headline "Emergency Blood Request Coordination"
  - Subheadline about coordinator verification
  - Three trust cards: Verified Process, Nearby Matching, Privacy Protected
  - Primary CTA "Continue Emergency Request" → `/request/blood`
  - Secondary "Call helpline" link
- `src/routes/request.review.tsx` — Review & Confirm
  - Reads from `useRequest()` and renders summary cards: blood group + units + component, urgency, hospital + locality, attendant + masked phone, proof status
  - Edit links jumping back to each step
  - Primary CTA "Submit Emergency Request" → `/request/submitted`
  - Disabled if any required field missing (with inline missing-field hints)
- `src/routes/request.submitted.tsx` — Submitted + verifying
  - Performs the Supabase `blood_requests` insert that today lives in `verifying.tsx`
  - Displays the generated Request ID (short form), "Verification in progress", est. review time
  - Operational timeline: Submitted → Under Review → Donor Matching → Donor Confirmed (animated state progression)
  - Helpline CTA
  - Auto-navigates to `/request/matching` once the timeline completes
- `src/routes/request.confirmation.tsx` — not needed (covered by submitted + matching)

## Files to edit

- `src/routes/request.tsx` — keep RequestProvider/Outlet, no logic change
- `src/routes/request.blood.tsx` — bump `<StepShell step={1} total={4} />`
- `src/routes/request.hospital.tsx` — `step={2} total={4}`
- `src/routes/request.proof.tsx` — `step={3} total={4}`, change CTA target to `/request/review`
- `src/components/request/StepShell.tsx` — accept dynamic `total` (already does); add labeled step pills (Requirement · Hospital · Proof · Review) under the progress bars for clarity
- `src/components/landing/Hero.tsx` — change `<Link to="/request">` so the "Request blood" CTA hits the new intro (already `/request`, but verify it isn't redirecting to `/request/blood` anywhere; keep as `/request`)
- `src/routes/request.verifying.tsx` — DELETE (logic moves into `submitted.tsx`)
- `src/lib/request-store.tsx` — no schema change needed; `requestId` already there

## Routing/typing

After adding/removing route files, the TanStack Router Vite plugin will regenerate `routeTree.gen.ts` automatically — no manual edit. All `navigate({ to: ... })` and `<Link to=...>` calls will be type-checked against the new tree.

## Design rules

- Mobile-first, semantic tokens only (`bg-card`, `text-foreground`, `border-border`, `var(--shadow-soft)`, `var(--gradient-emergency)`, etc.) — matches existing `StepShell` system.
- Reuse `StepShell`, `PrimaryButton`, and existing icon set (lucide).
- Operational microcopy on every screen explains what's happening + what's next.
- Progress tracker visible on steps 1–4; steps 0/5/6/7 use the `showBack=false` operational header.

## What this does NOT change

- Database schema, RLS policies, auth flow, donor flows, admin flows, landing-page sections — all untouched.
- Realtime activity feed and matching simulation timing remain as-is (only minor copy polish in matching).

Ready to implement on approval.