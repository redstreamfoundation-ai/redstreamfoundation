# Replace email/Google login with Phone OTP (Message Central)

## Overview
Replace the current email + Google OAuth `/auth` page with a 2-step phone OTP flow powered by Message Central VerifyNow. Indian mobile numbers only (country code 91). On successful OTP validation the user is signed into Lovable Cloud (Supabase) and redirected based on origin (`/donor/...` vs `/request/...`).

## User flow
1. User lands on `/auth?redirect=...` from donor or patient pages.
2. Enters 10-digit Indian mobile number → tap **Send OTP**.
3. Server (TanStack server function) requests a Message Central token, then calls `POST /verification/v3/send` (`flowType=SMS`, `countryCode=91`).
4. User enters 6-digit OTP → tap **Verify & continue**.
5. Server calls `POST /verification/v3/validateOtp`. On success, server signs the user into Supabase by phone (creates user if first time) and returns a session.
6. Client sets the session and navigates to `redirect` (`/donor/register` for donors, `/request/submitted` for patients). The existing `ensure_my_role` RPC reconciles donor/patient role based on origin.

## Technical details

### Secrets (added before build)
- `MESSAGE_CENTRAL_CUSTOMER_ID`
- `MESSAGE_CENTRAL_API_KEY`

### New server functions (`src/lib/phone-auth.functions.ts`)
- `sendPhoneOtp({ phone })` — fetches MC token, calls `/verification/v3/send`, returns `{ verificationId }`. Validates phone is 10 digits.
- `verifyPhoneOtpAndSignIn({ verificationId, code, phone, intendedRole })` — calls `/verification/v3/validateOtp`. On success uses Supabase admin (`client.server.ts`) to:
  - find or create user by phone (`auth.admin.listUsers`/`createUser` with deterministic password derived from `MESSAGE_CENTRAL_API_KEY` + phone)
  - sets `user_metadata.intended_role`
  - signs in with that password using a fresh anon client to obtain `access_token`/`refresh_token`
  - returns `{ access_token, refresh_token }`

### DB migration
- Update `handle_new_user` trigger to also work when `phone` is set and `email` is null (already inserts into `profiles`/`user_roles`; just safe-guard nulls).

### Client changes
- Rewrite `src/routes/auth.tsx` to a 2-step phone OTP UI (red/white styling, matches existing `Field` components). Removes Google button, email/password, signup mode, forgot-password link.
- After verify, call `supabase.auth.setSession({ access_token, refresh_token })`, then `supabase.rpc('ensure_my_role', { _intended })`, then navigate to `redirect`.
- Delete `src/routes/reset-password.tsx` (no longer needed) and remove its route entry.

### Files touched
- add `src/lib/phone-auth.functions.ts`
- rewrite `src/routes/auth.tsx`
- delete `src/routes/reset-password.tsx`
- regenerated `src/routeTree.gen.ts` (auto)
- migration: relax `handle_new_user` for phone-only users

## Out of scope
- Resend OTP timer / rate-limit UI polish (basic disabled-while-busy only)
- Internationalisation beyond +91