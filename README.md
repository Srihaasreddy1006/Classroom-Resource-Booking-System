# 🎓 Classroom Resource Booking System (CRBS)
**Subject:** Web Technology (23CS2048) — Third Internal Assessment (IA3)  
**Project Type:** Individual Full Stack Web Development Project  
**Tech Stack:** Node.js, Express.js, MongoDB, Mongoose, HTML5, CSS3, JavaScript, Bootstrap 5

---

## 📌 Executive Summary & Objective

The **Classroom Resource Booking System (CRBS)** is a responsive full-stack web application developed to eliminate manual paperwork, scheduling confusions, and conflicting classroom reservations across college campuses. 

The application provides a centralized platform enabling **Students** and **Faculty Members** to verify classroom and equipment availability in real-time and submit online booking requests. **Administrators** maintain learning spaces, allocate portable multimedia hardware, review pending requests, resolve conflicts, and inspect automated audit trails.

### 🌟 Key Highlights
- **100% Conflict-Free Engine:** Server-side interval validation (`S1 < E2 && E1 > S2`) strictly rejects any double-booking for classrooms and hardware.
- **Dynamic Equipment Allocation:** Tracks inventory for portable presentation kits, projectors, smart boards, and lab apparatus with automatic quantity deduction and restoration upon cancellation.
- **Role-Based Access Control (RBAC):** Tailored dashboards and protected API endpoints for **Students**, **Faculty**, and **Administrators**.
- **15 Integrated Frontend Views:** Completely responsive HTML5, CSS3, JavaScript, and Bootstrap 5 frontend.
- **Zero-Friction Fallback Database:** Connects to standard local MongoDB (`mongodb://127.0.0.1:27017/classroom_booking_db`) with seamless in-memory MongoDB auto-fallback for instantaneous college evaluation on any system.
- **Automated Test Suite:** 17 Jest and Supertest test cases verifying authentication, RBAC, double-booking prevention, capacity limits, and equipment restitution.

---

## 🛠️ Technology Stack & Architecture

| Layer | Technologies Used | Justification |
| :--- | :--- | :--- |
| **Frontend** | HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3, Bootstrap Icons | Responsive, mobile-first design, fast rendering without heavy framework overhead. |
| **Backend Framework** | Node.js (v20+), Express.js (v4.21) | Asynchronous non-blocking event-driven runtime ideal for concurrent booking requests. |
| **Database** | MongoDB, Mongoose ODM (v8.9) | Document database providing dynamic schemas, indexing, and transactional data integrity. |
| **Security & Auth** | JWT (`jsonwebtoken`), `bcryptjs`, `helmet`, `express-rate-limit` | Industry-standard password hashing, stateless token authorization, and header protection. |
| **Testing** | `jest`, `supertest`, `mongodb-memory-server` | Comprehensive automated API testing and double-booking conflict simulation. |

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm (v9.0.0 or higher)
- *(Optional)* Local MongoDB installed and running on port 27017 (If MongoDB is not running locally, the application automatically launches an in-memory database instance).

### 1. Installation
Clone or navigate to the project directory:
```powershell
cd c:\Users\reddy\Downloads\BHUMI-X_FINAL_FIXED_V3
```

Install backend dependencies:
```powershell
npm install
```

### 2. Configure Environment
Copy or verify the `.env` file (pre-configured):
```powershell
cp .env.example .env
```
Key variables:
```ini
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/classroom_booking_db
JWT_SECRET=crbs_jwt_secret_college_ia3_super_secure_key_2026
JWT_EXPIRES_IN=7d
```

### 3. Seed Sample Data
Populate the database with the 10 university classrooms (Classroom A to J), educational equipment inventory, and demo user accounts:
```powershell
npm run seed
```

### 4. Start the Application
Run the Express server:
```powershell
npm start
```
The application will be live at:
👉 **http://localhost:5000**

---

## 👥 Demo Evaluation Accounts

Pre-seeded accounts are provided with one-click quick-fill buttons on the login page:

| Role | Email Address | Password | Permissions & Dashboard |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@college.edu` | `AdminPassword@123` | Full control: approve/reject requests, manage classrooms & equipment, user accounts, audit trails, reports. |
| **Faculty Member** | `rajesh.faculty@college.edu` | `FacultyPassword@123` | Book classrooms & lecture halls, request equipment, view department schedules and notifications. |
| **Student** | `student@college.edu` | `StudentPassword@123` | View classrooms, submit booking requests, cancel pending/approved bookings, track status. |

---

## 📁 Project Directory Structure

```text
classroom-resource-booking/
├── client/                      # Complete HTML5/CSS3/Bootstrap Frontend
│   ├── index.html               # 1. Landing Page with live statistics
│   ├── login.html               # 2. Authentication Login with one-click demo fills
│   ├── register.html            # 3. Registration Page with validation
│   ├── student-dashboard.html   # 4. Student Portal
│   ├── faculty-dashboard.html   # 5. Faculty Portal
│   ├── admin-dashboard.html     # 6. Administrator Control Center
│   ├── classrooms.html          # 7. Classroom Directory & Search
│   ├── classroom-details.html   # 8. Classroom Specifications & Live Daily Schedule
│   ├── booking.html             # 9. Booking Form with Double-Booking Detector
│   ├── my-bookings.html         # 10. My Reservations & Cancellation Flow
│   ├── calendar.html            # 11. Interactive Daily & Weekly Timetable
│   ├── resources.html           # 12. Equipment & Peripherals Inventory
│   ├── notifications.html       # 13. In-App Alerts & Status Tracking
│   ├── profile.html             # 14. User Profile & Password Management
│   ├── reports.html             # 15. Analytics, Charts & Security Audit Logs
│   ├── css/
│   │   └── style.css            # Custom navy-blue UI theme and responsive components
│   └── js/
│       └── api.js               # Central API client, token management, navbar/footer renderers
├── server/                      # Node.js & Express.js Backend
│   ├── config/
│   │   └── db.js                # Resilient MongoDB connector with in-memory fallback
│   ├── models/
│   │   ├── User.js              # User schema with bcrypt password hashing
│   │   ├── Classroom.js         # Classroom A-J schema with capacity & facilities
│   │   ├── Resource.js          # Hardware inventory schema (installed vs portable)
│   │   ├── Booking.js           # Reservation schema with status transitions & indexes
│   │   ├── Notification.js      # In-app alerts schema
│   │   └── AuditLog.js          # Security audit trail schema
│   ├── routes/                  # Express REST API routes
│   │   ├── authRoutes.js
│   │   ├── classroomRoutes.js
│   │   ├── resourceRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── reportRoutes.js
│   │   └── userRoutes.js
│   ├── controllers/             # Business logic controllers
│   ├── middleware/              # JWT auth, RBAC authorization, and error handling
│   ├── services/                # Double-booking conflict detector and audit services
│   ├── tests/                   # Automated test suite
│   │   ├── auth.test.js
│   │   ├── booking.test.js
│   │   ├── classroom.test.js
│   │   └── setup.js
│   ├── app.js                   # Express application setup
│   └── server.js                # Server listener entrypoint
├── scripts/
│   ├── seedData.js              # 10 classrooms, equipment, users, and booking seeder
│   └── seed.js                  # Standalone database seeder runner
├── .env.example
├── .gitignore
├── package.json
├── README.md
├── REPORT.md                    # Comprehensive Academic Project Report for IA3
├── PRESENTATION.md              # 10-Slide Viva Presentation Deck
└── VIVA_QUESTIONS.md            # 25 High-Probability Viva Questions & Answers
```

---

## 🧪 Automated Testing Suite

The project includes 17 automated integration tests covering the critical application pathways.

Run the test suite:
```powershell
npm test
```

### Verified Test Cases:
1. **User Registration:** Valid user creation with encrypted password.
2. **Duplicate Prevention:** Rejection of duplicate email registrations.
3. **Password Security:** Enforcement of 6-character password policy.
4. **Login Authentication:** Verified token generation and payload matching.
5. **Invalid Credentials:** Rejection of incorrect passwords.
6. **Past Date Rejection:** Rejection of reservations requested for past dates.
7. **Time Interval Validation:** Rejection of requests where start time $\ge$ end time or duration $< 30$ mins.
8. **Capacity Validation:** Immediate rejection when attendee count exceeds classroom seating capacity.
9. **DOUBLE-BOOKING PREVENTION:** Rejection of overlapping time slots with HTTP `409 Conflict`.
10. **Alternative Room Suggestions:** Suggested active alternative classrooms with sufficient capacity.
11. **Equipment Inventory Allocation:** Automatic decrementing of portable hardware quantities on reservation.
12. **Administrator Approval Workflow:** Administrative approval with conflict re-check.
13. **Administrator Rejection Workflow:** Rejection with required reason and inventory restitution.
14. **User Cancellation:** Voluntary cancellation with immediate release of equipment inventory.
15. **Classroom Listing & Filtering:** Multi-parameter search by building, type, and capacity.
16. **Role-Based Access Control:** Rejection of non-admin users attempting administrative actions (HTTP 403 Forbidden).
17. **Notification Generation:** Automatic in-app notification dispatch on booking status transitions.

---

## 🌐 REST API Endpoints Reference

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a student or faculty account.
- `POST /api/auth/login` — Sign in and receive JWT token.
- `GET /api/auth/me` — Retrieve current user profile (Protected).
- `PUT /api/auth/profile` — Update user profile and change password (Protected).

### 🏫 Classrooms (`/api/classrooms`)
- `GET /api/classrooms` — List classrooms with query filtering (`type`, `building`, `minCapacity`, `search`).
- `GET /api/classrooms/:id` — Get specifications and installed equipment for a single classroom.
- `GET /api/classrooms/:id/schedule?date=YYYY-MM-DD` — Retrieve room's daily timetable.
- `POST /api/classrooms` — Add new classroom (Admin only).
- `PUT /api/classrooms/:id` — Update classroom specifications or status (Admin only).
- `DELETE /api/classrooms/:id` — Deactivate/delete classroom (Admin only).

### 💻 Resources & Equipment (`/api/resources`)
- `GET /api/resources` — List equipment items (`category`, `type`, `status`).
- `GET /api/resources/:id` — View resource details.
- `POST /api/resources` — Add equipment item (Admin only).
- `PUT /api/resources/:id` — Update quantity or toggle maintenance (Admin only).
- `DELETE /api/resources/:id` — Delete equipment item (Admin only).

### 📅 Bookings & Conflicts (`/api/bookings`)
- `POST /api/bookings` — Create reservation request with conflict detection and equipment allocation.
- `GET /api/bookings/check-availability` — Fast query endpoint returning availability status and alternative rooms.
- `GET /api/bookings/my-bookings` — Retrieve personal bookings for logged-in user.
- `GET /api/bookings` — Retrieve campus reservations (with date and status filters).
- `GET /api/bookings/:id` — Retrieve booking details.
- `PUT /api/bookings/:id/status` — Approve or reject booking request (Admin only).
- `PUT /api/bookings/:id/cancel` — Cancel booking and release allocated equipment (Owner or Admin).

### 🔔 Notifications & Reports (`/api/notifications`, `/api/reports`, `/api/users`)
- `GET /api/notifications` — Retrieve in-app alerts and unread count.
- `PUT /api/notifications/:id/read` — Mark notification as read.
- `PUT /api/notifications/read-all` — Mark all notifications as read.
- `GET /api/reports/dashboard-stats` — System KPIs, classroom utilization, and top facilities.
- `GET /api/reports/audit-logs` — Administrative audit trail (Admin only).
- `GET /api/users` — List accounts and toggle activation status (Admin only).

---

## 📦 Submission & GitHub Commands

To initialize and push the repository to your personal GitHub account:
```powershell
# 1. Initialize local repository in project directory
git init

# 2. Add all project files
git add .

# 3. Commit the project
git commit -m "feat: complete Classroom Resource Booking System for Web Tech IA3"

# 4. Set branch to main
git branch -M main

# 5. Link to your GitHub repository (replace with your repo URL)
git remote add origin https://github.com/YOUR_USERNAME/classroom-resource-booking-system.git

# 6. Push to GitHub
git push -u origin main
```
*Note: `.gitignore` is pre-configured so `node_modules` and `.env` credentials will never be committed to GitHub.*

---

## 👨‍🎓 Assessment Academic Details
- **Course:** Web Technology (23CS2048)
- **Evaluation:** Third Internal Assessment (IA3)
- **Student Name:** [Student Name]
- **Register Number:** [Register Number]
- **Department:** Department of Computer Science and Engineering
- **Academic Year:** 2026 – 2027
