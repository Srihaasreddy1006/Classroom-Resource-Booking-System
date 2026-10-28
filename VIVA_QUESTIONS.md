# 🎓 VIVA VOCE QUESTIONS & ANSWERS
## Classroom Resource Booking System — Web Technology (23CS2048)

This guide contains **25 high-probability viva voce questions and simple answers** tailored for an individual third-year Computer Science student.

---

### **Q1: What is full-stack web development?**
**Answer:**  
Full-stack web development involves building both the client-side (frontend) that users interact with and the server-side (backend and database) that processes business logic, enforces security, and stores data. In this project, the frontend uses HTML5, CSS3, JavaScript, and Bootstrap 5, while the backend uses Node.js, Express.js, and MongoDB.

---

### **Q2: What is Node.js, and why is it used in this project?**
**Answer:**  
Node.js is an open-source, cross-platform JavaScript runtime built on Chrome's V8 engine that allows JavaScript to run on the server. We use Node.js because its asynchronous, non-blocking event-driven architecture efficiently handles multiple concurrent requests (such as simultaneous room availability checks) without freezing server threads.

---

### **Q3: What is Express.js?**
**Answer:**  
Express.js is a minimal and flexible web application framework for Node.js. It simplifies routing, middleware integration (like authentication, CORS, and rate limiting), request/response handling, and the creation of RESTful APIs.

---

### **Q4: What is MongoDB, and how does it differ from relational databases like MySQL?**
**Answer:**  
MongoDB is a NoSQL, document-oriented database that stores data in flexible, JSON-like BSON documents instead of rigid tables and rows. Unlike relational databases that require fixed schemas and complex table joins, MongoDB easily handles nested structures such as a classroom's list of installed equipment and facilities.

---

### **Q5: What is Mongoose, and what role does it play in the backend?**
**Answer:**  
Mongoose is an Object Data Modeling (ODM) library for MongoDB and Node.js. It provides schema definitions, data type validation, default values, pre-save middleware hooks (such as hashing passwords with `bcrypt`), and querying methods for collections.

---

### **Q6: What is a REST API?**
**Answer:**  
A REST (Representational State Transfer) API is an architectural style for network communication where client and server exchange data using standard HTTP methods:
- `GET`: Retrieve data (e.g., fetch classrooms or bookings).
- `POST`: Submit new data (e.g., register a user or create a booking).
- `PUT`: Update existing data (e.g., approve a booking or edit a profile).
- `DELETE`: Remove data (e.g., remove an equipment item).

---

### **Q7: How does the frontend communicate with the backend?**
**Answer:**  
The frontend communicates asynchronously using the modern JavaScript `fetch()` API. Requests send and receive JSON data over HTTP, including an `Authorization: Bearer <token>` header to authenticate the user.

---

### **Q8: How is user authentication implemented in the system?**
**Answer:**  
Authentication is implemented using **JSON Web Tokens (JWT)**:
1. The user enters their email and password on `login.html`.
2. The server verifies credentials against MongoDB.
3. If valid, the server signs a JWT containing the user ID and sends it back.
4. The client stores the token in `localStorage` and includes it in the `Authorization` header of subsequent requests.
5. The `protect` middleware on the server validates the token on each protected route.

---

### **Q9: Why is password hashing necessary, and what library was used?**
**Answer:**  
Storing plaintext passwords in a database is a major security vulnerability. If the database is compromised, plaintext passwords are leaked immediately. We used **`bcryptjs`** to salt and hash passwords before saving them to MongoDB. Salt adds random data to the hash, preventing dictionary attacks and rainbow table lookups.

---

### **Q10: What is the difference between client-side and server-side input validation?**
**Answer:**  
- **Client-Side Validation:** Runs in the user's browser (e.g., checking required fields or email formats before submitting) to provide fast visual feedback.
- **Server-Side Validation:** Runs on the Express server and independently verifies all inputs. This is mandatory because client-side checks can be bypassed using tools like Postman or Curl.

---

### **Q11: How does the system prevent double-booking? (Most Important Question)**
**Answer:**  
The system prevents double-booking using a temporal interval overlap formula on the server:  
Two bookings overlap if and only if:  
$$\text{Existing.StartTime} < \text{New.EndTime} \quad \land \quad \text{Existing.EndTime} > \text{New.StartTime}$$  

Before creating or approving a booking for a classroom on a specific date, the server queries MongoDB for any active booking (`Approved` or `Pending`) that satisfies this condition. If any overlapping booking exists, the server rejects the request with HTTP **`409 Conflict`** and suggests available alternative classrooms.

---

### **Q12: What HTTP status codes are used, and what do they mean?**
**Answer:**  
- `200 OK`: Request succeeded (e.g., fetched classrooms).
- `201 Created`: Resource created successfully (e.g., booking created or user registered).
- `400 Bad Request`: Invalid input (e.g., missing fields or booking date in the past).
- `401 Unauthorized`: Missing or invalid authentication token.
- `403 Forbidden`: Authenticated user lacks permission (e.g., student trying to access admin endpoints).
- `404 Not Found`: Resource does not exist (e.g., classroom ID not found).
- `409 Conflict`: Double-booking detected or duplicate email registered.
- `500 Internal Server Error`: Unexpected server-side exception.

---

### **Q13: What are CRUD operations, and give examples from the project?**
**Answer:**  
CRUD stands for Create, Read, Update, and Delete:
- **Create:** Submitting a booking request via `POST /api/bookings`.
- **Read:** Viewing classrooms via `GET /api/classrooms`.
- **Update:** Administrator approving a booking via `PUT /api/bookings/:id/status`.
- **Delete:** Removing equipment via `DELETE /api/resources/:id`.

---

### **Q14: What is Role-Based Access Control (RBAC)?**
**Answer:**  
RBAC restricts access to pages and API endpoints based on the logged-in user's role:
- **Student:** Can view rooms, request bookings, and cancel their own bookings.
- **Faculty:** Can schedule lectures/labs, check room slots, and request equipment.
- **Administrator:** Can approve/reject bookings, manage classrooms and equipment, view audit logs, and toggle user accounts.

The `authorize('admin')` middleware enforces this on the server.

---

### **Q15: How are bookings stored in MongoDB?**
**Answer:**  
Bookings are stored in the `bookings` collection as Mongoose documents. Each document contains:
- Unique `bookingId` (e.g., `BK-20261029-4102`).
- References (`ObjectId`) linking to the `User` and `Classroom`.
- Reservation `date`, `startTime`, and `endTime`.
- `purpose` and `attendees` count.
- An array of reserved `additionalEquipment`.
- `status` (`Pending`, `Approved`, `Rejected`, `Cancelled`).
- Compound indexes on `{ classroom, date, status }` for rapid conflict queries.

---

### **Q16: What happens when a booking is cancelled?**
**Answer:**  
When a user or administrator cancels a booking:
1. The booking status is updated to `Cancelled` with a recorded `cancellationReason`.
2. Any allocated portable equipment quantities are immediately added back to the available inventory in MongoDB.
3. The slot is freed so other applicants can book that classroom.
4. An in-app notification is sent, and an audit trail entry is logged.

---

### **Q17: How does the administrator approve or reject requests?**
**Answer:**  
On the Admin Dashboard (`admin-dashboard.html`), the administrator reviews pending requests:
- **Approve:** The server re-checks for conflicts (to avoid race conditions) and sets status to `Approved`. The applicant receives an approval notification.
- **Reject:** The admin enters a rejection reason. The status is set to `Rejected`, any reserved equipment is released back to stock, and the applicant is notified of the rejection reason.

---

### **Q18: How was the project tested?**
**Answer:**  
The project was tested using automated integration tests with **Jest** and **Supertest** against an in-memory MongoDB database. We executed **17 test cases** across three suites:
1. `auth.test.js` (registration, password policy, login, route security).
2. `classroom.test.js` (listing, filtering, RBAC student restriction, admin updates).
3. `booking.test.js` (past dates, time ordering, capacity limits, double-booking rejection, equipment deduction and restitution).  
All 17 tests passed 100%.

---

### **Q19: What is the purpose of database seeding?**
**Answer:**  
Database seeding (`npm run seed`) populates the database with initial demonstration data:
- 10 sample classrooms (Classroom A to J) with varying capacities and types.
- 12 educational equipment items (installed and portable).
- Demo student, faculty, and administrator accounts.
- Sample bookings in different statuses (Approved, Pending, Rejected, Cancelled).  
This allows evaluators to immediately test the application without manually creating data from scratch.

---

### **Q20: What are the main limitations of the current system?**
**Answer:**  
1. In-app notifications are stored in the database, but external email notifications require an active SMTP mail server configuration.
2. Building locations are displayed in text and badges rather than an interactive 2D graphical floor map.

---

### **Q21: What future enhancements can be added?**
**Answer:**  
1. **Interactive SVG Campus Map:** Visual floor maps showing real-time room occupancy colors.
2. **QR Code Attendance:** Generating a QR code for approved bookings for door scanning.
3. **IoT Smart Building Integration:** Automatically powering on projectors and air conditioners 10 minutes before an approved booking starts.

---

### **Q22: What is the purpose of the `helmet` and `express-rate-limit` packages?**
**Answer:**  
- **`helmet`**: Sets secure HTTP response headers to protect against cross-site scripting (XSS), clickjacking, and MIME-type sniffing.
- **`express-rate-limit`**: Limits the number of API requests from a single IP address (e.g., 300 requests per 15 minutes) to protect against denial-of-service (DoS) and brute-force password guessing.

---

### **Q23: How does the system handle database connectivity if local MongoDB is not running?**
**Answer:**  
The database connector (`server/config/db.js`) includes an automatic fallback mechanism: if the connection to `mongodb://127.0.0.1:27017` fails, it automatically spins up an in-memory MongoDB instance using `mongodb-memory-server` and seeds the demo classrooms and accounts. This guarantees the application runs on any evaluation computer without manual MongoDB installation.

---

### **Q24: What is the difference between installed and portable equipment in this system?**
**Answer:**  
- **Installed Equipment:** Permanently mounted hardware inside a specific classroom (such as a ceiling laser projector or smart board). It cannot be removed or reserved separately.
- **Portable Equipment:** Mobile campus assets (such as presentation clickers, portable projectors, and wireless microphones) that have an inventory count and can be added to any classroom reservation.

---

### **Q25: Why is this project suitable for an individual student presentation?**
**Answer:**  
The project is built with clean, modular JavaScript, standard Bootstrap components, and clear architectural boundaries. It avoids unnecessary complexity while delivering complete full-stack functionality: authentication, CRUD operations, database indexing, double-booking prevention, automated tests, and professional UI design.
