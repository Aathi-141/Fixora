# Fixora: Home-Service Booking Platform — Comprehensive Technical Guide

Welcome to the complete technical and operational documentation for **Fixora**, a full-stack, mobile-first on-demand home service marketplace designed and developed for the **IT3060 Human-Computer Interaction (HCI) Assignment**.

---

## 1. Executive Summary & Architecture Overview

Fixora connects Sri Lankan homeowners with verified local home service specialists (Electricians, Plumbers, Cleaners, AC Technicians, Carpenters, and Painters). The application delivers role-tailored user interfaces for **Customers**, **Service Providers**, and **Platform Administrators**.

```mermaid
graph TD
    Client["Mobile Android App (Standalone APK) / Expo Web"] -->|HTTPS REST API| Vercel["Vercel Cloud Serverless Functions (Node.js / Express)"]
    Vercel -->|Mongoose ODM| Atlas[("MongoDB Atlas Cloud Database (Cluster0)")]
    Client -->|EAS Cloud Build| Expo["Expo Application Services (EAS Build)"]
```

---

## 2. Technology Stack

### A. Mobile Frontend
- **Framework**: [React Native](https://reactnative.dev/) (`0.86.3`) with [Expo SDK 57](https://expo.dev/) (`~57.0.27`).
- **Routing & Navigation**: `@react-navigation/native` (`^7.0.14`), `@react-navigation/native-stack` (`^7.2.0`), and `@react-navigation/bottom-tabs` (`^7.2.0`).
- **Design System & Styling**: Custom responsive layout with safe-area handling (`react-native-safe-area-context` `~5.7.0`), native screen optimization (`react-native-screens` `~4.26.0`), and Fixora Emerald/Forest Green palette (`#1E4D2B`, `#2E7D32`, `#E8F5E9`).
- **Icons & Typography**: `@expo/vector-icons` (`^15.0.2`) with `expo-font`.
- **Local Persistence**: `@react-native-async-storage/async-storage` (`2.2.0`) for offline caching of JWT auth tokens, active bookings, and local preferences.
- **Hardware & Multimedia**:
  - `expo-image-picker` for profile photos and dispute evidence.
  - `expo-sharing` & `expo-print` for generating official payment receipts.
- **Build System**: Expo Application Services (`eas-cli` `^24.12.0`) producing native `.apk` packages.

### B. Backend API Layer
- **Runtime**: [Node.js](https://nodejs.org/) (`v20+` / `v24 LTS`).
- **Web Framework**: [Express.js](https://expressjs.com/) (`^4.21.2`).
- **Authentication**: Stateless [JSON Web Tokens (JWT)](https://jwt.io/) (`jsonwebtoken` `^9.0.3`) and password hashing via [bcryptjs](https://www.npmjs.com/package/bcryptjs) (`^3.0.3`) with 10 salt rounds.
- **Cross-Origin & Logging**: `cors` (`^2.8.5`) and `morgan` (`^1.10.1`) request logging.
- **Environment Management**: `dotenv` (`^17.3.1`).

### C. Database Layer
- **Database Engine**: [MongoDB Atlas](https://www.mongodb.com/atlas) Cloud Cluster (M0 Sandbox).
- **Object Data Modeling (ODM)**: [Mongoose](https://mongoosejs.com/) (`^8.23.0`) with schema validation, indexes, and serverless connection pooling (`readyState` caching).

### D. Cloud Infrastructure & DevOps
- **Backend Deployment**: [Vercel](https://vercel.com/) (Serverless Express API with serverless rewrite routing).
- **Mobile Packaging**: [Expo EAS Build](https://expo.dev/eas) (Cloud Gradle builder producing universal ARM64/ARMv7 APKs).
- **Version Control**: [GitHub](https://github.com/Aathi-141/Fixora) (`Aathi-141/Fixora`).

---

## 3. Deployment Details, URLs & Credentials

### A. Live Cloud Endpoints
| Service | Environment | Live URL |
|---|---|---|
| **Backend REST API** | Vercel Cloud (Production 24/7) | `https://fixora-mu-tan.vercel.app` |
| **Health Check Endpoint** | Vercel Cloud | `https://fixora-mu-tan.vercel.app/` |
| **Providers Endpoint** | Vercel Cloud | `https://fixora-mu-tan.vercel.app/api/providers` |
| **GitHub Repository** | Version Control | `https://github.com/Aathi-141/Fixora` |
| **Expo EAS Project** | APK Cloud Build | `@aathi141/fixora` |

### B. Cloud Database & Security Secrets
- **MongoDB Atlas URI**:
  ```text
  mongodb+srv://fixora_admin:fixora2026@cluster0.7ugiyyl.mongodb.net/fixora?retryWrites=true&w=majority
  ```
- **Database Name**: `fixora`
- **Database Admin User**: `fixora_admin`
- **Database Admin Password**: `fixora2026`
- **JWT Secret Key**: `fixora_super_secret_jwt_key_2026_it3060_hci`
- **Expo Build Project ID**: `de64b9b1-3a5a-4b0f-8a6c-f0cf57f1901e`

---

## 4. Pre-Configured Test Accounts

All pre-seeded test accounts use the universal password: **`password123`**

### 1. Platform Administrator
- **Email**: `admin@fixora.lk`
- **Password**: `password123`
- **Role**: `admin`
- **Capabilities**: Executive KPI metrics, platform-wide user directory, provider licensing verification, booking oversight, customer dispute resolution & wallet credits.

### 2. Customers (Homeowners)
- **Account 1**: `kasun@gmail.com` | `password123` (Kasun Perera - Malabe)
- **Account 2**: `lakmini@gmail.com` | `password123` (Lakmini S. - Beliyatta)
- **Capabilities**: Explore services, filter specialists, book time slots, add-ons, in-app chat, VoIP calling, cancellation, rescheduling, 5-star ratings with praise chips & tips.

### 3. Service Providers (Tradespeople)
| Category | Name | Email | Password | Rating |
|---|---|---|---|---|
| **Electrician** | Ramesh Mendis | `ramesh@fixora.lk` | `password123` | 4.8 ⭐ |
| **Plumber** | Sunil Perera | `sunil@fixora.lk` | `password123` | 4.9 ⭐ |
| **Cleaner** | Chaminda Wickramasinghe | `chaminda@fixora.lk` | `password123` | 4.9 ⭐ |
| **AC Tech** | Nuwan Pradeep | `nuwan@fixora.lk` | `password123` | 4.8 ⭐ |
| **Carpenter** | Rohan Wickramasinghe | `rohan@fixora.lk` | `password123` | 4.7 ⭐ |
| **Painter** | Bandara Wijethunga | `bandara@fixora.lk` | `password123` | 4.8 ⭐ |

---

## 5. File-by-File Codebase Dictionary

```
hci assignment 3/
├── backend/
│   ├── controllers/         # Business logic & request handling
│   ├── middleware/          # JWT authorization guard
│   ├── models/              # Mongoose data schemas
│   ├── routes/              # Express REST routing
│   ├── seed/                # Initial MongoDB database seeder
│   ├── test/                # Automated API test suite
│   ├── .env                 # Environment variables
│   ├── server.js            # Express server & Serverless DB handler
│   └── vercel.json          # Vercel deployment configuration
└── frontend/
    ├── assets/              # App branding, square icons, splash images
    ├── src/
    │   ├── context/         # React Context state management
    │   ├── navigation/      # Stack & Bottom-Tab navigators
    │   ├── screens/         # UI screens split across team members
    │   ├── services/        # HTTP API client layer
    │   └── theme/           # Unified color palette & typography
    ├── app.json             # Expo native configuration
    └── eas.json             # EAS Build profile configuration
```

---

### Backend Directory (`backend/`)

#### Configuration & Server Entry
- [**`server.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/backend/server.js): The central entrypoint of the backend. Configures Express middlewares (`cors`, `morgan`, `json`), mounts all `/api/*` routes, provides a root `/` API health-check, exports `app` for Vercel Serverless Functions, and implements a cached MongoDB connection handler (`connectToDatabase()`) to prevent cold-start buffering timeouts.
- [**`vercel.json`**](file:///c:/Users/user/Desktop/hci%20assignment%203/backend/vercel.json): Vercel Serverless deployment descriptor directing all traffic (`/(.*)`) to `@vercel/node` executing `server.js`.
- [**`.env`**](file:///c:/Users/user/Desktop/hci%20assignment%203/backend/.env): Houses runtime secrets: `PORT`, `MONGODB_URI`, `JWT_SECRET`, and `NODE_ENV`.
- [**`package.json`**](file:///c:/Users/user/Desktop/hci%20assignment%203/backend/package.json): Lists Node.js dependencies and test commands (`test`, `test:member1`, `test:member2`, `test:member3`, `test:member4`).

#### Models (`backend/models/`)
- [**`User.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/backend/models/User.js): Core user document containing `name`, `email`, hashed `password`, `phone`, `role` (`'customer'`, `'provider'`, `'admin'`), `address`, and `avatar`.
- [**`ProviderProfile.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/backend/models/ProviderProfile.js): Service provider document storing `category`, `specialization`, `experienceYears`, `hourlyRate`, `rating`, `reviewCount`, `isAvailable`, `weeklySchedule`, `workingHours`, `skills`, `verificationStatus` (`'verified'`, `'pending'`), and `licenseNumber`.
- [**`Booking.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/backend/models/Booking.js): Booking lifecycle schema with `bookingRef`, `customer`, `provider`, `serviceCategory`, `scheduledDate`, `timeSlot`, `status` (`'pending'`, `'accepted'`, `'in_progress'`, `'completed'`, `'cancelled'`), `pricing` breakdown, `paymentMethod`, and audit reschedule/cancel logs.
- [**`ChatMessage.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/backend/models/ChatMessage.js): Message schema storing `booking`, `sender`, `recipient`, `text`, `type` (`'text'`, `'system'`, `'quick_reply'`), and `timestamp`.
- [**`Review.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/backend/models/Review.js): Feedback schema recording `booking`, `customer`, `provider`, `rating` (1–5), `comment`, `praiseChips`, and `tipAmount` in LKR.
- [**`Dispute.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/backend/models/Dispute.js): Support dispute schema storing customer complaints, claims, evidence images, and resolution audit notes.

#### Controllers (`backend/controllers/`)
- [**`authController.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/backend/controllers/authController.js): Handles registration (`register`), login (`login`), profile fetch/update (`getMe`, `updateProfile`), and Google OAuth simulation (`googleAuth`).
- [**`providerController.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/backend/controllers/providerController.js): Handles provider search with category/budget/rating filters, profile fetching, and schedule availability updates (`updateAvailability`).
- [**`bookingController.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/backend/controllers/bookingController.js): Handles appointment creation (`createBooking`), fetching (`getBookings`, `getBookingById`), rescheduling (`rescheduleBooking`), cancellation (`cancelBooking`), and provider status transitions (`updateBookingStatus`).
- [**`reviewController.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/backend/controllers/reviewController.js): Handles rating submissions (`submitReview`), provider review queries, and chat history fetch/send (`getChatMessages`, `sendChatMessage`).
- [**`adminController.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/backend/controllers/adminController.js): Powers administrator features: live KPI calculations (`getOverviewStats`), user directory (`getAdminUsers`), provider fleet inspection (`getAdminProviders`), licensing verification (`verifyProvider`), and dispute management (`getDisputes`, `resolveDispute`).

#### Routes (`backend/routes/`)
- [**`authRoutes.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/backend/routes/authRoutes.js): Maps `/api/auth` endpoints.
- [**`providerRoutes.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/backend/routes/providerRoutes.js): Maps `/api/providers` and `/api/provider` endpoints.
- [**`bookingRoutes.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/backend/routes/bookingRoutes.js): Maps `/api/bookings` endpoints.
- [**`reviewRoutes.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/backend/routes/reviewRoutes.js): Maps `/api/reviews` endpoints.
- [**`adminRoutes.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/backend/routes/adminRoutes.js): Maps `/api/admin` endpoints.

#### Middleware (`backend/middleware/`)
- [**`authMiddleware.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/backend/middleware/authMiddleware.js): Intercepts incoming requests, verifies the Bearer JWT token in the `Authorization` header, and attaches the authenticated user to `req.user`.

#### Seeding & Tests (`backend/seed/` & `backend/test/`)
- [**`seedData.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/backend/seed/seedData.js): Clears and seeds MongoDB Atlas with realistic Sri Lankan service specialists, customers, bookings, reviews, and admin data.
- [**`api.test.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/backend/test/api.test.js): Comprehensive 19-test automated test suite covering all functional requirements (FR-01 through FR-18).
- **`member1.test.js`** - **`member4.test.js`**: Isolated module unit tests for individual grading requirements.

---

### Frontend Directory (`frontend/`)

#### Configuration & Infrastructure
- [**`app.json`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/app.json): Expo app configuration specifying app name, package name (`com.fixora.app`), 512x512 square adaptive icons, plugins (`expo-sharing`, `expo-font`, `expo-build-properties`), and `usesCleartextTraffic: true`.
- [**`eas.json`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/eas.json): EAS Build configuration specifying the `"preview"` build profile with `"buildType": "apk"`.
- [**`package.json`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/package.json): Lists all React Native, Expo, and navigation dependencies.

#### Services & State (`frontend/src/`)
- [**`api.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/services/api.js): Centralized HTTP client. Defines `CLOUD_API_URL` (`https://fixora-mu-tan.vercel.app`), auto-resolves device IP in local development, and exports all backend API callers with timeouts and auth token injection.
- [**`AuthContext.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/context/AuthContext.js): React Context provider managing user session, login state, role determination (`customer`, `provider`, `admin`), profile updates, and logout.
- [**`AppNavigator.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/navigation/AppNavigator.js): Master navigation architecture:
  - `RootStackNavigator`: Splash, Login, AccountType, SignUp, Call modal, and `MainTabs`.
  - `CustomerTabNavigator`: Bottom tabs for Explore (`HomeTab`), Bookings (`HistoryTab`), Messages (`ChatTab`), and Profile (`ProfileTab`).
  - `ProviderTabNavigator`: Bottom tabs for Requests, Schedule, My Jobs, and Profile.
  - `AdminTabNavigator`: Bottom tabs for Overview, All Bookings, and Settings.
- [**`colors.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/theme/colors.js): Visual theme constants (`forestGreen: #1E4D2B`, `emerald: #2E7D32`, `mint: #A3D9A5`, `background: #F8FAF9`, etc.).

---

### UI Screens by Project Member

#### Member 1: Onboarding, Authentication & Discovery
- [**`SplashScreen.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/screens/member1/SplashScreen.js): Welcome screen with brand logo, animation, and entry points into the app.
- [**`LoginScreen.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/screens/member1/LoginScreen.js): Secure authentication with email/password validation, show/hide password toggle, and Google One-Tap sign-in.
- [**`AccountTypeScreen.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/screens/member1/AccountTypeScreen.js): Dual-card selector routing users to either Customer or Service Provider registration.
- [**`CustomerSignUpScreen.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/screens/member1/CustomerSignUpScreen.js): Homeowner registration with photo picker, name, email, phone, and address.
- [**`ProviderSignUpScreen.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/screens/member1/ProviderSignUpScreen.js): Trade professional onboarding with trade category selector, hourly rate in LKR, and license verification upload.
- [**`HomeScreen.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/screens/member1/HomeScreen.js): Primary customer portal featuring live search, service category carousel, promotional banners, and verified specialist cards.
- [**`FiltersScreen.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/screens/member1/FiltersScreen.js): Modal filter sheet with multi-attribute filtering (category, price range in LKR, minimum star ratings, sort orders).
- [**`ProviderProfileScreen.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/screens/member1/ProviderProfileScreen.js): Specialist profile displaying verified badge, hourly rates, experience, bio, customer reviews, and "Book Service" CTA.

#### Member 2: Service Booking Flow & Customer Profile
- [**`DateTimeSelectionScreen.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/screens/member2/DateTimeSelectionScreen.js): Interactive booking calendar with horizontal date strip and Morning/Afternoon time-slot selector pills.
- [**`BookingDetailsScreen.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/screens/member2/BookingDetailsScreen.js): Comprehensive booking confirmation screen with service address picker, optional add-on checkboxes with live price updates in LKR, gate instructions, and payment method selector.
- [**`BookingSuccessfulScreen.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/screens/member2/BookingSuccessfulScreen.js): Confirmation screen displaying booking reference, specialist appointment details, copy reference button, and CTAs to Track Specialist or Manage Booking.
- [**`CancelRescheduleScreen.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/screens/member2/CancelRescheduleScreen.js): Two-segmented booking modification screen:
  - **Reschedule**: Choose a new date/time slot with zero fee.
  - **Cancel**: Policy breakdown, reason selection, full refund initiation, and clean stack reset navigating back to the Home page.
- [**`CustomerProfileScreen.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/screens/member2/CustomerProfileScreen.js): Customer profile management with photo picker, contact details, saved addresses, notification toggles, and logout.

#### Member 3: Status Tracking, In-App Chat & Reviews
- [**`RequestStatusTrackingScreen.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/screens/member3/RequestStatusTrackingScreen.js): Live step-by-step progress timeline (*Assigned -> En Route -> Arrived -> Work in Progress -> Completed*) with dynamic ETA calculations and quick action buttons for Call and Chat.
- [**`ChatScreen.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/screens/member3/ChatScreen.js): Real-time chat interface with custom text input, quick-reply chips, message history, and direct phone link.
- [**`CallScreen.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/screens/member3/CallScreen.js): Simulated VoIP internet calling screen with live duration timer, mute, speaker, and end-call controls.
- [**`RateReviewScreen.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/screens/member3/RateReviewScreen.js): Post-service feedback screen with interactive 1–5 star ratings, praise chips (*"On Time"*, *"Clean Work"*, *"Polite"*), written feedback, and voluntary tipping in LKR.
- [**`ServiceHistoryScreen.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/screens/member3/ServiceHistoryScreen.js): Comprehensive bookings management screen with segmented tabs (*Ongoing* vs *Completed*), live status pills, "Track Service", "Book Again", and printable PDF payment receipts.

#### Member 4: Provider Operations & Admin Management
- [**`ProviderRequestsScreen.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/screens/member4/ProviderRequestsScreen.js): Provider dispatch queue displaying pending service appointments with 1-tap **Accept** and **Decline** actions.
- [**`ProviderAvailabilityScreen.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/screens/member4/ProviderAvailabilityScreen.js): Provider schedule manager with real-time toggle (*Available for Work* vs *Offline*), active working days checkboxes, and operating hours.
- [**`ProviderAccountScreen.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/screens/member4/ProviderAccountScreen.js): Provider business profile displaying stats (*Jobs Completed*, *Rating*, *On-Time Rate*), hourly rates in LKR, trade license number, and profile editing.
- [**`FinalBillPaymentScreen.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/screens/member4/FinalBillPaymentScreen.js): Final invoice settlement screen breaking down labor, diagnostics, parts, and taxes with card, cash, or bank payment processing.
- [**`AdminDashboardScreen.js`**](file:///c:/Users/user/Desktop/hci%20assignment%203/frontend/src/screens/member4/AdminDashboardScreen.js): Executive administrative console featuring 4 interactive live modals:
  1. **All Users Modal**: Search and filter all registered customers, providers, and admins with direct phone calling.
  2. **Active Providers Modal**: Inspect all trade specialists, availability badges, ratings, and licensing verification.
  3. **Bookings Lifecycle Modal**: Inspect all platform bookings across all statuses.
  4. **Customer Complaints & Disputes Modal**: Review filed claims and resolve issues with customer credit adjustments.

---

## 6. End-to-End User Journeys

### A. Customer Journey (Booking a Plumber)
1. **Launch App**: Open Fixora -> Land on Splash -> Tap **Get Started** -> **Login** with `kasun@gmail.com` / `password123`.
2. **Explore & Filter**: Tap the **Plumbing** icon or open **Filters** to sort by rating or budget.
3. **Select Specialist**: Tap **Sunil Perera** -> Inspect hourly rate (Rs. 650/hr), 4.9-star rating, bio, and reviews -> Tap **Book Service**.
4. **Choose Schedule**: Select preferred date (e.g. Oct 24) and time slot (e.g. 08:30 AM) -> Tap **Continue**.
5. **Review & Add-Ons**: Check service address, select optional add-ons (e.g. *"Emergency Rush Response (+Rs. 1,000)"*), write gate instructions, and tap **Confirm Appointment**.
6. **Confirmation**: View booking reference (e.g. `#FX-78921`) and confirmed total.
7. **Track & Communicate**: Tap **Track Specialist in Timeline** -> View live ETA, tap **Call** or **Chat** to coordinate.
8. **Completion & Review**: Once work is marked complete, submit a 5-star rating, praise chip, and tip.
9. **Cancellation / Reschedule**: If plans change, tap **Reschedule / Cancel** -> Reschedule with zero fee, or Cancel with 100% refund -> App cleanly returns to the Home page.

### B. Service Provider Journey
1. **Login**: Login with `sunil@fixora.lk` / `password123`.
2. **Manage Availability**: Navigate to **Schedule** tab -> Toggle status to **Available** and select operating days.
3. **Handle Dispatch Requests**: Switch to **Requests** tab -> View Kasun's booking request with address and scheduled time -> Tap **Accept Request**.
4. **Execute Job**: Job moves to active queue, coordinates with customer via chat, and completes work.

### C. Administrator Journey
1. **Login**: Login with `admin@fixora.lk` / `password123`.
2. **Executive Overview**: View live KPI cards (Total Users, Active Providers, Bookings, Disputes).
3. **Manage Platform**:
   - Tap **Total Users** -> Search any user by name, email, or phone.
   - Tap **Active Providers** -> Approve or verify new trade licenses.
   - Tap **Pending Disputes** -> Review customer claim and tap **Resolve & Issue Customer Credit**.

---

## 7. CLI & Operational Commands Reference

### Running the Project Locally
```bash
# 1. Start the Backend API (runs on port 5000)
cd "backend"
npm run dev

# 2. Start the Frontend in Web Browser
cd "frontend"
npx expo start --web

# 3. Start Frontend for Mobile (Expo Go)
cd "frontend"
npx expo start -c
```

### Running Automated Test Suites
```bash
# Run all 19 functional and CRUD tests
cd "backend"
npm test

# Run tests by member
npm run test:member1
npm run test:member2
npm run test:member3
npm run test:member4
```

### Building the Standalone Android APK
```bash
cd "frontend"
npx eas-cli build -p android --profile preview
```
