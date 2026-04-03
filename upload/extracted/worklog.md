---
Task ID: 1
Agent: Main
Task: Fix deployment failure - diagnose and repair corrupted config files

Work Log:
- Read package.json: valid JSON, no duplicate keys (previously corrupted, now fixed)
- Read prisma/schema.prisma: valid schema with all 8 models (User, Vehicle, Trip, Package, Reservation, Notification, Rating, TripShare)
- Read next.config.ts: was missing `output: "standalone"` required for deployment
- Added `output: "standalone"` to next.config.ts
- Ran `npx prisma validate` → Schema valid
- Ran `npx prisma generate` → Prisma Client generated successfully
- Ran `npm run build` after cleaning .next cache → Build passed successfully (17 pages, 24 API routes)
- Verified all 32 components exist in src/components/
- Verified project structure (src/app, src/components, src/hooks, src/lib, src/store)

Stage Summary:
- Root cause: `output: "standalone"` missing from next.config.ts
- Fixed by adding output: "standalone" to next config
- Build now passes cleanly - deployment should succeed
- All app components and API routes are intact

---
Task ID: 2
Agent: Main
Task: Fix deployment failure - remove unused UI components with missing dependencies

Work Log:
- Ran `npx tsc --noEmit` → Found 31+ TypeScript errors in src/components/ui/
- Identified that 33 of 49 UI component files are NOT imported anywhere in the app
- These unused files reference packages not in package.json (recharts, embla-carousel-react, react-day-picker, etc.)
- Deleted 33 unused UI component files (accordion, alert-dialog, calendar, carousel, chart, etc.)
- Identified 4 missing Radix packages needed by actually-used components: separator, toast, toggle, tooltip
- Installed @radix-ui/react-separator, @radix-ui/react-toast, @radix-ui/react-toggle, @radix-ui/react-tooltip
- Ran `npx tsc --noEmit` → 0 errors, exit code 0
- Ran `rm -rf .next && npm run build` → Build passed successfully

Stage Summary:
- Root cause of deployment failure: 33 unused shadcn/ui components referenced uninstalled packages
- Deployment platforms do fresh npm install from package.json, causing module-not-found errors
- Deleted all unused UI components and installed 4 missing Radix dependencies
- TypeScript check: 0 errors
- Production build: passed (17 pages, 24 API routes)

---
## Task ID: 3 - UI/UX Redesign for Illiterate Users (Senegal)
### Work Task
Complete redesign of the BOKKO carpooling app UI/UX to be ultra-simple for illiterate Senegalese drivers and passengers using basic Android phones. Passwordless phone-only auth, big touch targets, emojis as universal language, color-coded actions, and simplified flows.

### Changes Made

#### 1. Store (`src/store/store.ts`)
- No structural changes needed — store never had password in user type; it was only in login/register flows
- Kept all types, views, and state management intact

#### 2. API Routes
- **`src/app/api/auth/login/route.ts`**: Removed password requirement. Now accepts only `phone`, finds user by phone, returns user data + vehicle data. Returns `needsRegistration: true` when phone not found (404) or missing (400).
- **`src/app/api/auth/register/route.ts`**: Removed password from required fields. Now accepts `name`, `phone`, `role` (no password). Generates random 64-byte hex password hash for DB compatibility. Made `model` and `plateNumber` optional for vehicle creation (default to empty string).

#### 3. `src/components/HomePage.tsx`
- Replaced two text buttons with two LARGE CARD BUTTONS (min-height: 120px, rounded-2xl)
- Passenger card: 🧑‍💼 emoji, "PASSAGER" bold text, "Chercher un trajet" subtitle
- Driver card: 🚕 emoji, "CHAUFFEUR" bold text, "Publier un trajet" subtitle, gold background
- Bottom feature row: 3 emoji icons (🔒 Sécurité, 💰 Économique, 🤝 Communauté)
- Clean whitespace, Senegalese green (#006233) and gold (#FFD700) throughout

#### 4. `src/components/PassengerLogin.tsx`
- Removed password field entirely
- Single phone input with `text-2xl` centered text, auto-formatting with spaces (XX XX XX XXX)
- Single big green "SE CONNECTER" button (min-h-[56px])
- Auto-redirects to register if phone not found (uses `needsRegistration` from API)
- Simpler test account hint

#### 5. `src/components/PassengerRegister.tsx`
- 3-step wizard with emoji indicators: 📱 → ✍️ → ✅
- Step 1: Phone input with auto-advance after 9 digits
- Step 2: Name input (first name only)
- Step 3: Summary card showing phone + name, "CRÉER MON COMPTE" button
- Visual step circles with filled/active/completed states
- No password, no confirm password

#### 6. `src/components/DriverLogin.tsx`
- Same phone-only simplification as PassengerLogin
- Gold-themed "SE CONNECTER" button
- 🚕 emoji header

#### 7. `src/components/DriverRegister.tsx`
- Reduced from 4 steps (11 fields) to 3 steps (5 fields max)
- Step 1 "👤 Votre nom": Name + Phone (2 fields)
- Step 2 "🚗 Votre véhicule": Brand (dropdown: Toyota, Mercedes, Hyundai, Renault, Peugeot, Dacia, Autre), Color (dropdown: 6 options), Capacity (big number buttons: 4/5/6/7)
- Step 3 "💰 Paiement": Wave Business phone number input + "Plus tard" skip button
- No plate number, no model, no license fields (can be added in profile)
- Gold-themed step indicators

#### 8. `src/components/PassengerSearch.tsx`
- Replaced dropdowns with BIG LOCATION BUTTONS for departure and destination
- Locations: Thiès, Thiènaba, Dakar Plateau, Dakar Liberté, Dakar Médina, Dakar Almadies, Dakar Ouakam
- Selected buttons turn GREEN with checkmark
- Auto-swap button (⇄) between departure/destination rows
- 3 big date buttons: "📅 Aujourd'hui", "📅 Demain", "📅 Après-demain" (no date picker)
- Big green "RECHERCHER" button

#### 9. `src/components/PassengerTripDetail.tsx`
- Route visual: big red/green pin circles with 🚗 car icon in between
- 3 KEY INFO CARDS in grid: 🕐 Heure, 💰 Prix (green card), 💺 Places
- Driver card: big name + ⭐ rating + vehicle color dot + contact buttons
- Seat selector: big −/+ buttons with large number display
- Single big green "✅ RÉSER" button (or "💳 RÉSERVER ET PAYER" for Wave)
- Package button if applicable
- Removed: description, vehicle details card, badges, trip type

#### 10. `src/components/DriverDashboard.tsx`
- Welcome bar with emoji avatar and vehicle color dot
- Simple stats bar: "Aujourd'hui: X trajets | X FCFA"
- 2×2 grid of BIG SQUARE ACTION BUTTONS (min-h-[120px]):
  - ➕ "Publier trajet" (green)
  - ✓ "Réservations" (gold, with red badge for pending count)
  - 📦 "Colis" (blue, with badge)
  - 👤 "Mon profil" (gray)
- Removed: 5 stat cards, 5 list action buttons

#### 11. `src/components/DriverPublish.tsx`
- Card-based sections with clear emoji headers:
  - 📍 Trajet: Location buttons (same as search), swap button
  - 🕐 Quand partir?: 3 date buttons + 3 time slot buttons (🌅 Matin 7h, ☀️ Midi 12h, 🌆 Soir 17h) + custom hour input
  - 💰 Prix: 3 preset buttons (2000/2500/3000 FCFA) + custom input
  - 💺 Places: Big −/+ buttons (1-7), default 4
  - 📦 Accepter colis?: Toggle + preset price buttons (500/700/1000 FCFA/kg)
- Big "🚀 PUBLIER" button
- Removed: description field, trip type dropdown (defaults to ALLER_SIMPLE)

#### 12. `src/components/DriverManage.tsx`
- Visual reservation cards with:
  - BIG passenger name (text-lg bold) + phone icon
  - Simple route text + time
  - BIG price "2,500 FCFA" in text-xl bold
  - Status: emoji dots (🟡 En attente / 🟢 Confirmé / 🔴 Refusé)
  - Payment status: 💳 emoji dots
  - Two BIG ACTION BUTTONS: "✅ CONFIRMER" (green) / "❌ REFUSER" (red)
  - Call and WhatsApp contact buttons

#### 13. `src/components/PassengerDashboard.tsx`
- Welcome with big 👋 emoji avatar and 2xl name
- 3-column action cards: 🔍 Rechercher, 🎫 Réservations, 📦 Colis
- Quick search button (Thiès → Dakar)
- Simplified trip cards (route + time + driver name)

### Design Principles Applied
- **Phone-only auth**: No passwords anywhere, just phone number entry
- **Big touch targets**: All buttons min-h-[56px], inputs h-14 to h-16
- **Color-coded**: Green (#006233) confirm, Red (#CE1126) reject, Gold (#FFD700) pending/CTA
- **Emojis as language**: 🚗 driver, 👤 passenger, 📍 location, 💰 price, etc.
- **Fewer steps**: Registration reduced from 4 steps/11 fields to 3 steps/5 fields
- **Defaults**: Trip type defaults to ALLER_SIMPLE, capacity defaults to 4
- **Large text**: Important numbers in text-2xl or text-lg, buttons in font-bold

### Verification
- `npx tsc --noEmit`: 0 errors in src/ (only pre-existing skills/ directory errors)
- `npm run build`: Passed successfully (17 pages, 24 API routes)

---
## Task ID: 4 - Restore Password Fields to Auth System
### Work Task
Add password fields back to the BOKKO app auth system. The user wants passwords to be kept for security. This reverts the passwordless auth from Task ID 3 while preserving the simplified UI/UX design.

### Changes Made

#### 1. `src/components/PassengerRegister.tsx`
- Added imports: `Lock`, `Eye`, `EyeOff` from lucide-react
- Added state: `password`, `showPassword`, `passwordInputRef`
- Expanded from 3 steps to 4 steps:
  - Step 1: 📱 Téléphone (phone input, auto-advance after 9 digits)
  - Step 2: ✍️ Nom (name input, validated ≥ 2 chars before next)
  - Step 3: 🔒 Mot de passe (password input with show/hide toggle, min 6 chars validation)
  - Step 4: ✅ Valider (summary card with phone, name, masked password + create button)
- Updated `stepEmojis` and `stepLabels` to 4 items
- Step indicator uses slightly smaller circles (w-10 h-10) and smaller labels (text-[9px]) to fit 4 steps
- Added password to register API body: `{ phone, name, password, role: 'PASSENGER' }`
- Added "Minimum 6 caractères requis" amber warning text when password is too short

#### 2. `src/components/DriverRegister.tsx`
- Added imports: `Lock`, `Eye`, `EyeOff` from lucide-react
- Added state: `password`, `showPassword`
- Added password field to Step 1 (after name and phone), with show/hide toggle
- Updated Step 1 title from "👤 Votre nom" to "👤 Vos informations"
- Added password validation (min 6 chars) to Step 1 "next" button check
- Added password to register API body: `{ phone, name, password, role: 'DRIVER', ... }`
- Added "Minimum 6 caractères requis" amber warning text when password is too short

#### 3. `src/app/api/auth/login/route.ts`
- Added `import bcrypt from 'bcryptjs'`
- Changed destructuring from `{ phone }` to `{ phone, password }`
- Added password verification after finding user: uses `bcrypt.compare()` to check provided password against stored hash
- Returns 401 with "Mot de passe incorrect" on mismatch
- Keeps `needsRegistration` flow when user not found

#### 4. `src/app/api/auth/register/route.ts`
- Added `password` to destructured body
- Added server-side password validation: if provided, requires minimum 6 characters (returns 400 with error)
- Replaced random password generation with conditional logic:
  - If `password` provided → hash it with bcrypt (salt rounds: 10)
  - If no `password` → fall back to random 64-byte hex password hash (for backward compatibility)
- Kept `import crypto` for the fallback random password path

### Verification
- `npx tsc --noEmit`: 0 errors
- `npm run build`: Passed successfully (17 pages, 24 API routes)

---
## Task ID: 5 - Simplify Locations & Add Exact Destination
### Work Task
Simplify driver trip publishing and passenger search to use only 3 city-level locations (Thiènaba, Thiès, Dakar). Add an "exact destination" field to reservations so passengers can specify their precise drop-off location (e.g., "Dakar Plateau", "Thiès Kaur") when booking.

### Changes Made

#### 1. `src/components/DriverPublish.tsx`
- Changed `LOCATIONS` array from 7 locations to 3: `['Thiènaba', 'Thiès', 'Dakar']`

#### 2. `src/components/PassengerSearch.tsx`
- Changed `LOCATIONS` array from 7 locations to 3: `['Thiènaba', 'Thiès', 'Dakar']`

#### 3. `prisma/schema.prisma`
- Added optional `exactDestination String?` field to the `Reservation` model
- Ran `npx prisma db push` — schema synced successfully

#### 4. `src/components/PassengerTripDetail.tsx`
- Added `EXACT_DESTINATIONS` constant mapping each city to sub-locations:
  - Dakar: Plateau, Liberté, Médina, Almadies, Ouakam, Parcelles, Autre
  - Thiès: Kaur, Sindia, Centre, Ndioloff, Autre
  - Thiènaba: Village, Marché, Autre
- Added state: `exactDestination`, `customDestination`
- Added `getExactDestinations()` helper that looks up sub-locations by trip destination
- Added "📍 Où souhaitez-vous être déposé ?" card between seat selector and book button
- Shows grid of destination buttons (same styling as search buttons) + "Autre" text input
- Validation: requires exact destination when sub-locations are available
- Added `Input` import for the custom destination text field
- Sends `exactDestination` in the booking API call body

#### 5. `src/app/api/reservations/route.ts`
- Destructures `exactDestination` from POST body
- Includes `exactDestination` in reservation creation data
- Appends exact destination to driver notification message: `"Thiès → Dakar (Dakar Plateau)"`

#### 6. `src/components/DriverManage.tsx`
- Added `exactDestination?: string | null` to `ReservationData` interface
- Shows exact destination in green next to route info in both pending and history reservation cards
- Example display: `Thiès → Dakar (Dakar Plateau)`

#### 7. `src/components/PassengerReservations.tsx`
- Added `exactDestination?: string | null` to `ReservationData` interface
- Shows exact destination next to the route in reservation cards
- Example display: `Thiès → Dakar (Dakar Plateau)`

#### 8. `src/app/api/seed/route.ts`
- Updated all 6 trip destinations from "Dakar - Plateau" / "Dakar - Liberté" / etc. to just "Dakar"
- Updated all 6 trip origins from "Dakar - Plateau" etc. to just "Dakar"
- Added `exactDestination` to all 3 sample reservations: "Dakar Plateau", "Dakar Almadies", "Dakar Liberté"
- Updated all notification messages to use simplified city names and include exact destinations

### Verification
- `npx tsc --noEmit`: 0 errors
- `npm run build`: Passed successfully (17 pages, 24 API routes)

---
## Task ID: 6 - Add Cash + Wave Payment Options for Reservations & Packages
### Work Task
Allow passengers to pay by Cash (💵 espèces) or Wave (💳 mobile) for both trip reservations and packages. Previously, payment was Wave-only for reservations. Packages had Wave with a cash fallback message but no actual cash button.

### Changes Made

#### 1. `src/components/PaymentModal.tsx` (Complete rewrite)
- Removed dependency on `WavePayButton` component
- Added 3-step payment flow:
  - **Step 1**: Choose method — Two big cards: "Payer par Wave 💳" (blue) and "Payer en espèces 💵" (gold). Wave card only shown if driver has `waveBusinessLink`.
  - **Step 2**: Instructions — For Wave: opens Wave link + confirm button. For Cash: shows driver name + date + confirm button.
  - **Step 3**: Confirmation — "J'ai effectué le paiement" sends `{ paymentStatus: 'PAID', paymentMethod: 'CASH'|'WAVE' }` to API.
- Updated `driver.waveBusinessLink` type to accept `null` (for drivers without Wave)
- Modal no longer requires `waveBusinessLink` to be shown — always available via Cash option

#### 2. `src/app/api/reservations/[id]/payment/route.ts`
- Added `paymentMethod` parameter acceptance from request body
- Validates `paymentMethod` is 'CASH' or 'WAVE' if provided
- Defaults to 'WAVE' for backward compatibility when no method specified
- Notification messages now include the actual payment method ("en espèces" or "via Wave")
- Driver confirmation notification uses `reservation.paymentMethod` to mention correct method

#### 3. `src/app/api/packages/[id]/route.ts`
- Payment status update now accepts `paymentMethod` from request body
- If `paymentMethod` is 'CASH' or 'WAVE', uses it; otherwise defaults to 'WAVE'
- Backward compatible with existing code

#### 4. `src/components/PassengerReservations.tsx`
- "Payer 💳" button now always visible for PENDING payments (no longer gated by `waveBusinessLink`)
- Payment Modal now renders without `waveBusinessLink` check
- Added `Banknote` import from lucide-react
- Payment status message adapts color/icon based on method: gold for Cash, blue for Wave

#### 5. `src/components/PassengerTripDetail.tsx`
- Payment Modal now always renders (not gated by `waveBusinessLink`)

#### 6. `src/components/PassengerPackages.tsx`
- When package is active (PICKED_UP/IN_TRANSIT) and not paid:
  - **Wave button** (blue): "PAYER PAR WAVE 💳" — opens driver's Wave link, then confirm
  - **Cash button** (gold): "J'AI PAYÉ EN ESPÈCES 💵" — immediately confirms cash payment
- Cash button always available regardless of driver's Wave link
- Payment confirmed message now shows method ("en espèces" or "via Wave")

#### 7. `src/components/DriverManage.tsx`
- Added `Banknote` import
- Payment confirmation section shows correct method with icon/color:
  - Cash: 💵 gold text + Banknote icon + "reçus en espèces"
  - Wave: 💙 blue text + CreditCard icon + "reçus via Wave"

#### 8. `src/components/DriverPackages.tsx`
- Added `Banknote` import
- Payment confirmation section shows correct method with icon/color (same pattern as DriverManage)

### Verification
- `npx tsc --noEmit`: 0 errors
- `npm run build`: Passed successfully (17 pages, 24 API routes)

---
## Task ID: 7 - Fix Driver Seeing Passenger Views
### Work Task
Fix bug where a driver user sees the passenger space after clicking a notification or navigating. The root cause was NotificationsPanel always redirecting to passenger views, compounded by BackButton not checking role, and no global view-role guard.

### Root Cause Analysis
1. **NotificationsPanel.tsx line 125**: `setView('passenger-trip-detail')` called regardless of user role
2. **BackButton.tsx**: Passenger view back-transitions didn't check role
3. **store.ts**: `setView()` had zero validation
4. **page.tsx**: No startup validation for stale localStorage state

### Changes Made

#### 1. `src/store/store.ts`
- `setView()` now checks user role before allowing view change
- DRIVER cannot navigate to passenger views (→ redirects to driver-dashboard)
- PASSENGER cannot navigate to driver views (→ redirects to passenger-dashboard)

#### 2. `src/components/NotificationsPanel.tsx`
- Role check in `handleClick`: driver → `driver-manage`, passenger → `passenger-trip-detail`

#### 3. `src/components/BackButton.tsx`
- All passenger sub-views now check role before back-navigation
- Driver on passenger view → back to `driver-dashboard`

#### 4. `src/app/page.tsx`
- Startup useEffect auto-corrects wrong view based on user role (fixes stale localStorage)

### Verification
- `npm run build`: Passed successfully (17 pages, 24 API routes)

---
## Task ID: 8 - Final Bug Audit & Fixes
### Work Task
Comprehensive audit of the entire BOKKO application to find and fix remaining bugs before final deployment.

### Bugs Found & Fixed

#### 🔴 Bug 1 & 2 (CRITICAL): Passenger blocked from viewing driver profile and rating drivers
- **Root cause**: `driver-profile` and `driver-rating` were in the `driverViews` restriction list in the store guard
- **Impact**: When a passenger clicked on a driver's name in PassengerTripDetail → redirected to passenger-dashboard instead of driver profile. "Noter ce chauffeur" button also didn't work.
- **Fix**: Renamed `passengerViews` → `passengerOnlyViews` and `driverViews` → `driverOnlyViews`. Removed `driver-profile` and `driver-rating` from `driverOnlyViews` so both roles can access these shared views.
- **Files changed**: `src/store/store.ts`, `src/app/page.tsx` (startup validation updated)

#### 🟡 Bug 3 (MAJOR): BackButton doesn't track real navigation history
- **Root cause**: BackButton used hardcoded switch/case mappings. E.g., passenger-trip-detail always went back to passenger-search, even if user came from passenger-reservations.
- **Fix**: Added `previousView` to store state. `setView()` now automatically saves the current view before transitioning. BackButton uses `previousView` first, falls back to role-based logic.
- **Files changed**: `src/store/store.ts` (added previousView tracking), `src/components/BackButton.tsx` (use previousView with smart fallback)

#### 🟡 Bug 4 (MAJOR): Header shows static "Pilote" label regardless of role
- **Root cause**: Header had hardcoded `<span>Pilote</span>` text
- **Fix**: Changed to dynamic display: `{user?.role === 'DRIVER' ? 'Chauffeur' : 'Passager'}`
- **Files changed**: `src/components/Header.tsx`

#### 🟡 Bug 5 (MAJOR): PackageForm missing description/weight/size fields
- **Root cause**: PackageForm only asked for recipient info + notes. The API was using defaults ('Colis', 1kg, 'M') for missing fields.
- **Fix**: Added 3 new fields to PackageForm:
  - Description textarea (required, max 200 chars) with character counter
  - Weight input (decimal, kg) with estimated price calculation
  - Size selector (4 options: S/Petit, M/Moyen, L/Grand, XL/Très grand) with descriptions
  - Estimated price display (price_per_kg × weight)
  - Footer shows dynamic price calculation
- **Files changed**: `src/components/PackageForm.tsx` (complete rewrite)

#### 🟢 Bug 6 (MINOR): Footer shows © 2025
- **Fix**: Updated to © 2026
- **Files changed**: `src/components/Footer.tsx`

### Verification
- `npm run build`: Passed successfully (17 pages, 24 API routes)

---
Task ID: 1
Agent: Super Z (main)
Task: Audit complet de l'app BOKKO - Détection et correction de bugs

Work Log:
- Lecture de TOUS les fichiers source (40+ fichiers) : composants, API routes, store, page.tsx, prisma schema
- Identification de 7 bugs dans l'application
- Correction de tous les 7 bugs
- Build vérifié avec succès (0 erreurs)

Stage Summary:
**7 bugs trouvés et corrigés :**
1. 🔴 BUG CRITIQUE: PackageForm envoyait le poids mais pas le montant total → L'API stockait le prix/kg au lieu du total. FIX: PackageForm envoie `amount: estimatedPrice` + API calcule `weight * pricePerKg` en fallback
2. 🔴 BUG CRITIQUE: Le bouton "Réserver" restait visible même si le passager avait déjà réservé. FIX: Cache le formulaire si `hasReservation=true` + affiche un message "déjà réservé" + vérifie aussi les réservations PENDING
3. 🔴 BUG CRITIQUE: Pas de bouton "Mes trajets" sur le dashboard chauffeur. FIX: Ajout du bouton + passage à une grille 3 colonnes (Publier, Mes trajets, Réservations, Colis, Profil)
4. 🔴 BUG CRITIQUE: Faille sécurité login - API autorisait connexion sans mot de passe. FIX: Le mot de passe est maintenant obligatoire dans l'API login
5. 🟡 BUG MOYEN: Refresh sur une vue détaillée (trip-detail, profile, etc.) montrait "non trouvé" car le state n'est pas persisté. FIX: Redirection vers le dashboard approprié au refresh
6. 🟡 BUG MOYEN: Pas de notification au chauffeur quand un passager paie un colis. FIX: Ajout notification dans l'API packages/[id]/PATCH quand paymentStatus passe à PAID
7. 🟢 BUG LEGER: DriverTrips chargeait TOUS les trajets puis filtrait côté client. FIX: Ajout paramètre driverId dans l'API trips + filtrage côté serveur

Fichiers modifiés:
- src/components/PackageForm.tsx
- src/app/api/packages/route.ts
- src/components/PassengerTripDetail.tsx
- src/components/DriverDashboard.tsx
- src/app/api/auth/login/route.ts
- src/app/page.tsx
- src/app/api/packages/[id]/route.ts
- src/app/api/trips/route.ts
- src/components/DriverTrips.tsx
