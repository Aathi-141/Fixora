# Fixora - Home-Service Booking Mobile Application
> **IT3060 - Human Computer Interaction (Year 3 Semester 2 2026)**  
> **Milestone 03: Mobile App Implementation & Final Evaluation**  
> **Group: [130]** | **Repository:** [https://github.com/Aathi-141/Fixora.git](https://github.com/Aathi-141/Fixora.git)

Fixora is a complete, full-stack on-demand home service booking mobile application (electricians, plumbers, cleaners, HVAC technicians, carpenters, painters) designed specifically for the Sri Lankan market (priced in **LKR**). It directly implements the user research, personas, empathy maps, and high-fidelity prototype flows developed and validated in Milestones 01 & 02.

---

## 1. Group Members & Workload Distribution

| Member | Student ID | Name | Git Email | Branch | Assigned Interfaces / Workload |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Member 1** | IT23861022 | Pushpakumara G.K.M.P (Manusha) | `manump715@gmail.com` | `feature/onboarding-discovery-manusha` | **Onboarding & Discovery:** Splash/Welcome, Login (Email & Google OAuth), Account Type Selection, Customer Sign-Up, Provider Sign-Up, Home/Search, Service Filters, Provider Profile. |
| **Member 2** | IT23546202 | Aathika M.A.F | `aathikaasmeer14@gmail.com` | `feature/booking-flow-aathika` | **Booking Flow:** Date & Time Selection (interactive monthly calendar grid, time slots, add-on toggles), Booking Details Review, Booking Successful confirmation, Cancel & Reschedule Flow with refund dialog. |
| **Member 3** | IT23843202 | Basnayaka B.M.A.S.S (Shakya) | `shakyasandali039@gmail.com` | `feature/status-reviews-shakya` | **Status, Chat & Reviews:** Request Status Tracking (live timeline & ETA), In-App Chat (with 1-tap quick replies) & Call simulation, Ratings & Reviews (1–5 stars, praise chips, tipping), Service Request History (Ongoing/Completed). |
| **Member 4** | IT23841604 | Kavindya P.W.D (Dasuni) | `dasunikavindya38@gmail.com` | `feature/provider-admin-dasuni` | **Provider & Admin Management:** Provider Accept/Reject Request, Provider Profile & Availability Management, Admin Dashboard (KPI metrics, dispute management, provider approvals), Final Bill & Payment Summary with itemized breakdown. |

---

## 2. Technology Stack & Justification

- **Frontend:** **React Native using Expo (managed workflow)**
  - Declarative cross-platform components for iOS, Android, and Web.
  - Native performance with thumb-friendly controls optimized for accessibility and low digital literacy constraints.
  - Color Theme: **Dark Forest Green (`#1E4D2B`)** for headers, **Sage Green (`#52B788`)** for active highlights and chips, and **Emerald (`#2D6A4F`)** for primary CTAs.
  - Currency: **Sri Lankan Rupees (LKR / Rs.)**.
- **Backend:** **Node.js with Express.js**
  - RESTful architecture with modular controllers, routes, and middleware.
  - Fast response times (< 100ms) satisfying NFR-03 (Performance) and NFR-10 (High traffic capacity).
- **Database:** **MongoDB with Mongoose ODM**
  - Flexible document schemas for dynamic services, add-ons, pricing breakdowns, and real-time chat messages.
  - Secured via environment variables (`.env`).
- **Authentication & Security:**
  - JWT (JSON Web Tokens) with bcrypt password hashing.
  - **Google OAuth** authentication endpoint (`POST /api/auth/google`) for single-tap social authentication.

---

## 3. Requirements Traceability & CRUD Matrix

| Req ID | Requirement | Assigned Member | Screen / Interface | Working CRUD Operations |
| :--- | :--- | :--- | :--- | :--- |
| **FR-01** | Create customer/provider account | Manusha | Sign-up (Customer / Provider) | **CREATE**: `POST /api/auth/register` |
| **FR-02** | Secure login & Google OAuth | Manusha | Login Screen | **READ**: `POST /api/auth/login`, `POST /api/auth/google` |
| **FR-03/04** | Search & filter services | Manusha | Home & Filters Screens | **READ**: `GET /api/providers?category=&search=&minRating=` |
| **FR-05/06** | View provider profile & select | Manusha | Provider Profile Screen | **READ**: `GET /api/providers/:id` |
| **FR-07/08** | Date/time selection & send request | Aathika | Date & Time, Booking Details | **CREATE**: `POST /api/bookings` |
| **FR-09** | Status notification & updates | Shakya | Request Status Tracking | **READ**: `GET /api/bookings/:id` |
| **FR-10** | Provider accept/decline request | Dasuni | Provider Accept/Reject | **UPDATE**: `PUT /api/bookings/:id/status` |
| **FR-11** | View live en-route status & ETA | Shakya | Request Status Tracking | **READ**: `GET /api/bookings/:id` |
| **FR-12** | Final bill after service | Dasuni | Final Bill / Payment Summary | **CREATE/UPDATE**: `POST /api/bookings/:id/pay` |
| **FR-13** | Cancel or reschedule appointment | Aathika | Cancel / Reschedule Screen | **UPDATE**: `PUT /api/bookings/:id/reschedule`, `PUT /api/bookings/:id/cancel` |
| **FR-14** | In-app chat & direct call | Shakya | Chat & Call Screen | **CREATE/READ**: `POST & GET /api/bookings/:id/messages` |
| **FR-15** | Ratings, reviews & tips | Shakya | Rate & Review Screen | **CREATE/READ**: `POST /api/reviews`, `GET /api/reviews/provider/:id` |
| **FR-16** | Provider profile & availability mgmt | Dasuni | Work Management & Availability | **UPDATE**: `PUT /api/provider/availability`, `PUT /api/provider/profile` |
| **FR-17** | Admin manages users/providers/disputes | Dasuni | Admin Dashboard | **READ/UPDATE**: `GET /api/admin/overview`, `PUT /api/admin/providers/:id/verify`, `PUT /api/admin/disputes/:id/resolve` |
| **FR-18** | Service request history | Shakya | Service History Screen | **READ**: `GET /api/bookings/my-history` |

---

## 4. Setup & Running Instructions

### Prerequisites
- [Node.js (v18+)](https://nodejs.org/)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) running locally on port 27017 (or a MongoDB Atlas connection string).

---

### Step 1: Backend Setup (`/backend`)

1. Open a terminal and navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Verify or adjust the `.env` file:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/fixora_db
   JWT_SECRET=fixora_super_secret_jwt_key_2026_it3060_hci
   NODE_ENV=development
   ```
4. **Seed the database** with realistic Sri Lankan service providers, bookings, reviews, and admin data:
   ```bash
   npm run seed
   ```
5. **Start the backend server:**
   ```bash
   npm start
   ```
   *The server runs on `http://localhost:5000`.*
6. *(Optional)* **Run automated API tests** covering all 18 functional requirements:
   ```bash
   npm test
   ```

---

### Step 2: Frontend Setup (`/frontend`)

1. Open a second terminal window and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
3. Start the Expo development server:
   ```bash
   npx expo start
   ```

### Step 3: Previewing the Mobile App
When Expo starts, you have 3 ways to preview:
- **On Web Browser (Fastest for testing on PC):**
  Press **`w`** in the Expo terminal. The app will launch in your browser at `http://localhost:8081` (or `8082`).
- **On Physical Android Phone:**
  Install **Expo Go** from Google Play Store, connect your phone to the same Wi-Fi as your computer, and scan the QR code displayed in the terminal.
- **On Physical iPhone:**
  Install **Expo Go** from Apple App Store, open the iPhone Camera app, and scan the QR code to open in Expo Go.
- **On Android Emulator:**
  Press **`a`** in the terminal with Android Studio running.

---

## 5. Project Directory Structure

```text
hci assignment 3/
├── backend/
│   ├── controllers/            # Auth, Provider, Booking, Chat, Review, Admin
│   ├── middleware/             # JWT auth & role authorization
│   ├── models/                 # Mongoose schemas (User, Provider, Booking, Chat, Review, Dispute)
│   ├── routes/                 # Express REST API routes
│   ├── seed/                   # Database seed script with Sri Lankan fixtures
│   ├── test/                   # Automated functional test suite (18/18 PASS)
│   ├── .env                    # Environment variables
│   ├── package.json
│   └── server.js               # Express application entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── context/            # AuthContext (JWT session, Google login, role switch)
│   │   ├── navigation/         # NativeStack & BottomTab AppNavigator
│   │   ├── screens/
│   │   │   ├── member1/        # Splash, Login, AccountType, SignUps, Home, Filters, ProviderProfile
│   │   │   ├── member2/        # DateTimeSelection, BookingDetails, BookingSuccessful, CancelReschedule
│   │   │   ├── member3/        # RequestStatusTracking, Chat, Call, RateReview, ServiceHistory
│   │   │   └── member4/        # ProviderRequests, ProviderAvailability, AdminDashboard, FinalBillPayment
│   │   ├── services/           # REST API client connecting to backend
│   │   └── theme/              # Color system (Forest Green, Sage Green, Emerald, LKR currency)
│   ├── App.js                  # Main React Native root component
│   └── package.json            # Expo managed dependencies
│
├── .gitignore
└── README.md
```

---

## 6. Git Branching Strategy & Attribution

To satisfy the SLIIT IT3060 university assignment guidelines, each group member's assigned workload is committed to their respective feature branch with their official name and email address:
- `feature/onboarding-discovery-manusha` by **Pushpakumara G.K.M.P** (`manump715@gmail.com`)
- `feature/booking-flow-aathika` by **Aathika M.A.F** (`aathikaasmeer14@gmail.com`)
- `feature/status-reviews-shakya` by **Basnayaka B.M.A.S.S** (`shakyasandali039@gmail.com`)
- `feature/provider-admin-dasuni` by **Kavindya P.W.D** (`dasunikavindya38@gmail.com`)

All feature branches are merged into `main`, delivering a fully integrated, runnable application ready for live demonstration and viva evaluation.
