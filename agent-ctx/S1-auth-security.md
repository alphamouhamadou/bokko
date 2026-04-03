---
## Task ID: S1 - Auth & Security P1/P2
### Work Task
Implement 5 security features for the BOKKO carpooling PWA: Password Reset (forgot/reset), Password Change, Login Rate Limiting, Account Deletion, and Session Timeout.

### Work Summary

All 5 features have been implemented successfully:

#### Files Created (10 new files)
1. **`src/app/api/auth/forgot-password/route.ts`** - POST endpoint: phone → 6-digit OTP (10min expiry), returns OTP for testing
2. **`src/app/api/auth/reset-password/route.ts`** - POST endpoint: phone+OTP+newPassword → verifies OTP, resets password, clears reset fields
3. **`src/app/api/auth/change-password/route.ts`** - POST endpoint: userId+currentPassword+newPassword → verifies, updates
4. **`src/app/api/auth/delete-account/route.ts`** - POST endpoint: userId+password → soft delete (deletedAt), clears reset tokens
5. **`src/app/api/auth/update-activity/route.ts`** - POST endpoint: userId → updates lastActivity, checks deleted status
6. **`src/components/ForgotPassword.tsx`** - 2-step form (phone → OTP+password), shows dev OTP, BOKKO green theme
7. **`src/components/ChangePassword.tsx`** - 3-field form with show/hide, validation, success toast
8. **`src/components/DeleteAccount.tsx`** - Red danger button + Dialog confirmation with password, auto-logout
9. **`src/components/SettingsView.tsx`** - Settings page: account info, session info, password change, account deletion
10. **`src/hooks/useSessionTimeout.ts`** - 5-min interval checker, 7-day timeout, auto-logout, deleted account detection

#### Files Modified (6 existing files)
1. **`src/store/store.ts`** - Added `'forgot-password'` and `'settings'` to View type
2. **`src/app/api/auth/login/route.ts`** - Full rate limiting (5 attempts → 30min lockout), lastActivity on success, soft-delete check
3. **`src/components/PassengerLogin.tsx`** - Lockout warning card, disabled submit when locked, "Mot de passe oublié?" link
4. **`src/components/DriverLogin.tsx`** - Same lockout UI and forgot password link
5. **`src/components/Header.tsx`** - Settings gear icon (⚙) button before notifications bell
6. **`src/app/page.tsx`** - Added ForgotPassword + SettingsView rendering, excluded forgot-password from header/footer

#### TypeScript Verification
- 0 new errors introduced in src/ files
- All pre-existing errors in other files (trips/route.ts, PaymentModal.tsx, etc.) are unrelated
