# 📽️ PRESENTATION SLIDE OUTLINE
## Classroom Resource Booking System — Web Technology (23CS2048) IA3

---

### **Slide 1: Title Slide**
- **Project Title:** Classroom Resource Booking System (CRBS)
- **Subtitle:** A Full-Stack Centralized Facility & Hardware Management Platform
- **Course:** Web Technology (23CS2048) — Third Internal Assessment (IA3)
- **Presenter:** [Student Name] ([Register Number])
- **Department:** Department of Computer Science & Engineering
- **Institution:** [College Name]

---

### **Slide 2: Problem Statement**
- **Manual Scheduling Hurdles:** Physical paper registers, WhatsApp group messages, and department spreadsheets cause recurring double-booking collisions.
- **Resource Shortages:** Presentation hardware (portable projectors, wireless microphones) requested without inventory tracking leads to hardware unavailability during lectures.
- **Capacity Mismatches:** Overcrowding caused by events booked into spaces smaller than the expected attendee count.
- **Lack of Transparency:** Students and faculty have no visibility into room availability or the status of their requests.

---

### **Slide 3: Project Objectives**
- **Centralize Learning Facilities:** Provide single-window reservation for 10 diverse university learning spaces (Standard, Smart, Seminar Hall, Computer Lab, Conference Room).
- **100% Conflict-Free Engine:** Implement algorithmic double-booking detection ($S_1 < E_2 \land E_1 > S_2$) on the server to prevent overlapping approved slots.
- **Smart Suggestions:** Recommend available alternative classrooms with matching capacity when conflicts occur.
- **Inventory Tracking:** Model installed vs. portable hardware with automatic count deduction and restitution upon cancellation.
- **Role-Based Security:** Protect student, faculty, and administrator workflows using JSON Web Tokens (JWT) and `bcrypt` password hashing.

---

### **Slide 4: Proposed Solution**
- **Three-Tier Architecture:** Decoupled modern frontend (HTML5/CSS3/Bootstrap 5) consuming Express.js RESTful APIs backed by MongoDB Mongoose schemas.
- **Role-Specific Dashboards:**
  - *Student Portal:* Submit booking requests, view live approval status, cancel reservations, inspect in-app notifications.
  - *Faculty Portal:* Schedule lectures/laboratories, check slot availability in real time, request presentation equipment.
  - *Admin Control Center:* Single-click approval, written rejection workflow, classroom & hardware CRUD, and audit logs.
- **Interactive Calendar:** Visual daily and 7-day weekly schedule views with color-coded status badges.

---

### **Slide 5: Technology Stack & Justification**
- **Frontend:** HTML5, CSS3, JavaScript (ES6+), Bootstrap 5.3, Bootstrap Icons.
  - *Why:* Zero build-step overhead, fast loading, mobile-first responsive layout.
- **Backend:** Node.js, Express.js (v4.21).
  - *Why:* Asynchronous non-blocking event loop handles concurrent availability queries efficiently.
- **Database:** MongoDB & Mongoose ODM (v8.9).
  - *Why:* Flexible JSON document model, subdocuments for hardware, and compound indexes for fast slot matching.
- **Security & Quality:** JWT, `bcryptjs`, `helmet`, `express-rate-limit`, Jest, Supertest.

---

### **Slide 6: System Architecture**
```text
[ Browser Client (Bootstrap 5 / Vanilla JS) ]
                     │  (HTTP / JSON with Bearer JWT)
                     ▼
[ Express.js REST API Layer (Node.js Server) ]
   ├── Helmet & Rate Limiter Security Middleware
   ├── JWT Authentication & Role Authorization (RBAC)
   ├── Double-Booking Validation & Alternative Finder
   └── Centralized Error Handling Pipeline
                     │  (Mongoose Queries)
                     ▼
[ MongoDB Database (Local or Auto In-Memory Fallback) ]
   ├── Users • Classrooms • Resources • Bookings • Notifications • AuditLogs
```

---

### **Slide 7: Core Modules & Key Features**
1. **Authentication Module:** Registration with department/ID validation, password hashing, and stateless JWT sessions.
2. **Classroom Directory:** 10 sample rooms (Classroom A to J) with capacity filters, building locations, and specs.
3. **Double-Booking Engine:** Strictly rejects overlapping reservations with HTTP `409 Conflict`.
4. **Equipment Inventory Manager:** Tracks portable equipment counts (projectors, microphones, smart boards, lab kits).
5. **Interactive Timetable:** Daily and weekly calendar views with color-coded badges (Green = Approved, Yellow = Pending).
6. **Audit & Notifications:** In-app status alerts and immutable logging of all critical actions.

---

### **Slide 8: Demonstration Workflow**
- **Step 1: Explore Classrooms:** View Classroom A to J with live capacity badges and facilities.
- **Step 2: Submit Booking:** A student books Classroom A for tomorrow (09:00 - 11:00) with 1 portable projector. Status: *Pending*.
- **Step 3: Double-Booking Conflict Simulation:** A second user attempts to book Classroom A for tomorrow (10:00 - 12:00).
  - *Result:* Server intercepts collision, displays clear conflict alert, and suggests alternative rooms (e.g. Classroom B or F)!
- **Step 4: Administrator Review:** Admin logs in, inspects pending requests, reviews details, and clicks *Approve*.
- **Step 5: Cancellation & Restitution:** If a booking is cancelled, reserved portable equipment is instantly restored to inventory.

---

### **Slide 9: Testing & Assessment Results**
- **Automated Integration Testing:** 17 Jest and Supertest test cases executed across 3 test suites:
  - `booking.test.js` (7 tests: past date rejection, invalid time range, capacity overflow, double-booking rejection, equipment deduction & restitution).
  - `classroom.test.js` (4 tests: listing, filtering, RBAC student restriction, admin updates).
  - `auth.test.js` (6 tests: registration, duplicate email, password policy, login token, invalid password, route protection).
- **Result:** 100% Passing (17 / 17 tests passed).
- **Zero-Friction Execution:** In-memory MongoDB fallback ensures the app runs anywhere with `npm start`.

---

### **Slide 10: Conclusion & Future Scope**
- **Conclusion:** Successfully built a full-stack Classroom Resource Booking System satisfying all IA3 Web Technology requirements with verified double-booking prevention and responsive UI.
- **Future Scope:**
  - Dynamic 2D/3D visual campus map with SVG floor plans.
  - QR-code automated door check-in for approved applicants.
  - IoT integration to automate projector and AC power based on confirmed timetable slots.
- **Thank you! Questions & Viva Discussion.**
