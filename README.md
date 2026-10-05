# Fixora - Home-Service Booking Mobile Application
> **IT3060 - Human Computer Interaction (Year 3 Semester 2 2026)**  
> **Milestone 03: Mobile App Implementation & Final Evaluation**  
> **Group: [130]** | **Repository:** [https://github.com/Aathi-141/Fixora.git](https://github.com/Aathi-141/Fixora.git)

Fixora is a complete, full-stack on-demand home service booking mobile application (electricians, plumbers, cleaners, HVAC technicians, carpenters, painters) designed specifically for the Sri Lankan market . It directly implements the user research, personas, empathy maps, and high-fidelity prototype flows developed and validated in Milestones 01 & 02.



##  Technology Stack & Justification

- **Frontend:** **React Native using Expo (managed workflow)**
  - Declarative cross-platform components for iOS, Android, and Web.
  - Native performance with thumb-friendly controls optimized for accessibility and low digital literacy constraints.
  - Color Theme: **Dark Forest Green (`#1E4D2B`)** for headers, **Sage Green (`#52B788`)** for active highlights and chips, and **Emerald (`#2D6A4F`)** for primary CTAs.
- **Backend:** **Node.js with Express.js**
  - RESTful architecture with modular controllers, routes, and middleware.
  - Fast response times (< 100ms) satisfying NFR-03 (Performance) and NFR-10 (High traffic capacity).
- **Database:** **MongoDB Atlas (Cloud NoSQL) with Mongoose ODM**
  - Flexible document schemas for dynamic services, add-ons, pricing breakdowns, and real-time chat messages.
  - Secured via environment variables (`.env`).
- **Authentication & Security:**
  - JWT (JSON Web Tokens) with bcrypt password hashing.

---


##  Setup & Running Instructions

### Prerequisites
- [Node.js (v18+)](https://nodejs.org/)
- MongoDB Atlas Cloud Database URI configured in `backend/.env`.

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


3. **Start the backend server:**
   ```bash
   npm start
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
- **On Physical Android Phone:**
  Install **Expo Go** from Google Play Store, connect your phone to the same Wi-Fi as your computer, and scan the QR code displayed in the terminal.
- **On Physical iPhone:**
  Install **Expo Go** from Apple App Store, open the iPhone Camera app, and scan the QR code to open in Expo Go.
- **On Android Emulator:**
  Press **`a`** in the terminal with Android Studio running.
- **On Web Browser:**
  Press **`w`** in the terminal to view in browser.

---

##  Project Directory Structure

```text
hci assignment 3/
├── backend/
│   ├── controllers/            # Auth, Provider, Booking, Chat, Review, Admin
│   ├── middleware/             # JWT auth & role authorization
│   ├── models/                 # Mongoose schemas (User, Provider, Booking, Chat, Review, Dispute)
│   ├── routes/                 # Express REST API routes
│   ├── seed/                   # Database seed script with Sri Lankan fixtures
│   ├── test/                   # Automated functional test suite (18/18 PASS)
│   ├── .env                    # Environment variables (MongoDB Atlas Cloud connection)
│   ├── package.json
│   └── server.js               # Express application entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── context/            # AuthContext (JWT session, registered account persistence)
│   │   ├── navigation/         # NativeStack & BottomTab AppNavigator
│   │   ├── screens/
│   │   │   ├── member1/        # Splash, Login, AccountType, SignUps, Home, Filters, ProviderProfile (Manusha)
│   │   │   ├── member2/        # DateTimeSelection, BookingDetails, BookingSuccessful, CancelReschedule, CustomerProfile (Aathika)
│   │   │   ├── member3/        # RequestStatusTracking, Chat, Call, RateReview, ServiceHistory (Shakya)
│   │   │   └── member4/        # ProviderRequests, ProviderAvailability, AdminDashboard, FinalBillPayment (Dasuni)
│   │   ├── services/           # REST API client connecting to backend
│   │   └── theme/              # Color system (Forest Green, Sage Green, Emerald, LKR currency)
│   ├── App.js                  # Main React Native root component
│   └── package.json            # Expo managed dependencies
│
├── .gitignore
└── README.md
```

---



