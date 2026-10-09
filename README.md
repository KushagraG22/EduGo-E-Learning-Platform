# EduGo — Learn on the Move

> **EduGo** is a full-stack, 100% free online learning platform built for learners and educators everywhere.
> **Tagline:** *Learn on the Move*

---

## 🌟 Highlights & Key Features

- **Strict Two-Role System:** Role-based access control for **Students** and **Teachers**. No quizzes or assessments anywhere in the platform; course completion is determined purely by verified milestone completion of required curriculum lessons.
- **100% Free Learning:** All published courses are permanently free to enroll in with no subscriptions or paywalls.
- **Curriculum Architecture:** Support for **Video Lessons**, readable **Text Lessons**, and downloadable **Resource Files** organized into ordered sections.
- **Backend-Driven Progress Tracking:** Secure milestone calculation formula:
  $$\text{Progress} = \frac{\text{Completed Required Lessons}}{\text{Total Required Lessons}} \times 100$$
- **Automatic PDF Certificate Generation:** Generated on the backend with unique verification IDs and public verification portal (`/verify/:certificateId`).
- **In-App Notifications:** Real-time badge indicators, mark as read, and broadcasts when teachers post announcements.
- **Genuine Reviews & Ratings:** Only enrolled students can review courses (1 review per student per course), automatically computing real average ratings.
- **Public Teacher Profiles:** Dedicated instructor portfolios showcasing published courses and aggregate review metrics.
- **Private Student Profiles:** Strict learner privacy protection; student accounts and learning histories remain completely private.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18 with TypeScript
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (Plus Jakarta Sans typography, custom design system)
- **Routing:** React Router v6
- **Icons:** Lucide React
- **API Client:** Axios with JWT auto-injection

### Backend
- **Runtime:** Node.js (LTS v24)
- **Framework:** Express.js with TypeScript
- **Database:** MongoDB with Mongoose ODM
- **Validation:** Zod schemas
- **Authentication:** JWT tokens, bcryptjs hashing, Google OAuth ticket verification
- **Certificate Engine:** PDFKit (vector graphics, decorative borders, typography)
- **Media Engine:** Storage adapter supporting Cloudinary with local `/uploads` filesystem fallback
- **Email Engine:** Nodemailer with console development preview fallback

---

## 📂 Project Architecture

```
E-Learning Platform/
├── client/                     # Frontend React & Vite application
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/         # Navbar, Footer, Logo, Modal, RatingStars, etc.
│   │   │   ├── course/         # CourseCard, filters, curriculum items
│   │   │   └── layout/         # MainLayout, ProtectedRoute
│   │   ├── context/            # AuthContext, NotificationContext
│   │   ├── pages/
│   │   │   ├── public/         # Home, Explore, Details, Teacher Profile, Auth, Verification
│   │   │   ├── teacher/        # Dashboard, My Courses, Create/Edit, Curriculum, Announcements
│   │   │   └── student/        # Dashboard, My Learning, Player, History, Certificates
│   │   ├── services/           # Axios API client
│   │   └── types/              # Full TypeScript contracts
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.ts
├── server/                     # Backend Node.js & Express REST API
│   ├── src/
│   │   ├── config/             # MongoDB connection, env loader
│   │   ├── controllers/        # Auth, Courses, Curriculum, Enrollments, Progress, Reviews
│   │   ├── middleware/         # Authenticate, Authorize roles, Error handler, Rate limiting
│   │   ├── models/             # User, Course, Section, Lesson, Enrollment, Certificate, etc.
│   │   ├── routes/             # RESTful API route mounts
│   │   ├── services/           # PDF certificate generator, email service, storage service
│   │   ├── tests/              # Automated backend test suite with Vitest & Supertest
│   │   └── utils/              # Database seeder script, logger, JWT helpers
│   ├── uploads/                # Local uploaded assets & generated certificates
│   └── tsconfig.json
├── .env.example                # Template of all environment variables
├── package.json                # Root automation scripts
└── README.md
```

---

## 🚀 Quick Start Guide

### 1. Prerequisites
- **Node.js** (v18 or higher; LTS v24 recommended)
- **MongoDB** (Local MongoDB Server running on `mongodb://127.0.0.1:27017` or a MongoDB Atlas connection string)
- **npm** or **yarn**

### 2. Environment Variables Configuration
Copy the provided `.env.example` to `.env` at the root (or configure inside `server/`):

```bash
cp .env.example .env
```

| Variable | Default Value | Description |
| :--- | :--- | :--- |
| `PORT` | `5000` | Port for Express API |
| `NODE_ENV` | `development` | Environment mode (`development` or `production`) |
| `CLIENT_URL` | `http://localhost:5173` | Allowed origin for frontend application |
| `MONGODB_URI` | `mongodb://localhost:27017/edugo` | MongoDB connection URI |
| `JWT_SECRET` | *(Random secret)* | Secret key used to sign JWT authentication tokens |
| `JWT_EXPIRES_IN`| `7d` | Lifetime of authentication tokens |
| `GOOGLE_CLIENT_ID`| *(Optional)* | Google Cloud OAuth Client ID for Google Sign-In |
| `GOOGLE_CLIENT_SECRET`| *(Optional)* | Google Cloud OAuth Client Secret |
| `SMTP_HOST` | *(Optional)* | SMTP server host (e.g. `smtp.gmail.com`, `smtp.mailtrap.io`) |
| `SMTP_PORT` | `587` | SMTP server port (`587` for TLS, `465` for SSL) |
| `SMTP_USER` | *(Optional)* | SMTP account email / username |
| `SMTP_PASS` | *(Optional)* | SMTP account password / Google App Password |
| `EMAIL_FROM` | `EduGo <no-reply@edugo.org>` | Sender display name and address |
| `CLOUDINARY_CLOUD_NAME`| *(Optional)* | Cloudinary cloud name for remote media hosting |
| `CLOUDINARY_API_KEY`| *(Optional)* | Cloudinary API Key |
| `CLOUDINARY_API_SECRET`| *(Optional)* | Cloudinary API Secret |

---

### 3. Google OAuth Setup Guide

EduGo integrates genuine Google OAuth using both Google Identity Services (GSI ID token verification) and standard OAuth2 authorization code flows.

To enable Google login on your local or production instance:
1. Go to the [Google Cloud Console](https://console.cloud.google.com/).
2. Create a new project (e.g., `EduGo E-Learning`).
3. Navigate to **APIs & Services > OAuth consent screen**:
   - Choose User Type: **External**.
   - Fill in App Name (`EduGo`), User support email, and Developer contact information.
   - Add scopes: `.../auth/userinfo.email` and `.../auth/userinfo.profile`.
4. Navigate to **APIs & Services > Credentials**:
   - Click **Create Credentials > OAuth client ID**.
   - Application type: **Web application**.
   - Name: `EduGo Web Client`.
   - **Authorized JavaScript origins**:
     - `http://localhost:5173`
   - **Authorized redirect URIs**:
     - `http://localhost:5173/auth/google/callback`
5. Copy your **Client ID** and **Client Secret** into your `.env` file:
   ```env
   GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-client-secret
   ```
6. Restart the backend server. The "Continue with Google" button on both Login and Register pages will now authenticate against your Google project.

---

### 4. Password Reset & Email (SMTP) Setup Guide

EduGo dispatches single-use, 1-hour expiring password reset links.

#### Option A: Gmail (Recommended for quick testing)
1. In your Google Account, enable **2-Step Verification**.
2. Go to **Security > App passwords** (or search "App passwords").
3. Create an app password for `EduGo Email`.
4. Configure your `.env`:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-16-character-app-password
   EMAIL_FROM="EduGo <your-email@gmail.com>"
   ```

#### Option B: Mailtrap or Brevo (Recommended for team testing)
1. Create a free account on [Mailtrap.io](https://mailtrap.io/) or [Brevo.com](https://www.brevo.com/).
2. Copy your SMTP credentials to `.env`:
   ```env
   SMTP_HOST=sandbox.smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=your-mailtrap-user
   SMTP_PASS=your-mailtrap-password
   ```

#### Option C: Automated Development Mode (Zero External Setup Required)
- When SMTP credentials are not configured, EduGo automatically routes emails through an Ethereal test inbox or in-memory dispatch tracker, logging preview links in development and allowing full local end-to-end testing without external mail accounts.

---

### 5. Installation
Install root, server, and client dependencies:

```bash
# In project root
npm install

# In server
cd server && npm install

# In client
cd ../client && npm install
```

---

### 6. Seed the Database
Populate real sample teachers, students, published courses, curriculum modules, reviews, announcements, and certificates:

```bash
npm run seed --prefix server
```

#### Pre-configured Test Accounts:
- **Teacher Account:**
  - Email: `sarah.teacher@edugo.org`
  - Password: `Password123!`
- **Student Account:**
  - Email: `david.student@edugo.org`
  - Password: `Password123!`

---

### 7. Running the Application Locally
Run both backend and frontend concurrently:

```bash
npm run dev
```

- **Frontend Application:** [http://localhost:5173](http://localhost:5173)
- **Backend API Server:** [http://localhost:5000](http://localhost:5000)
- **Health Check Endpoint:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Automated Testing

EduGo includes a comprehensive automated test suite testing:
- Student & Teacher registration, role authorization, and duplicate email guards
- Course creation, draft hiding, and cross-course modification barriers
- Curriculum section and lesson management
- Free enrollment uniqueness
- Backend progress percentage calculation (required vs optional lesson rules)
- Real-time PDF certificate issuance & public verification
- Student review submission & course rating recalculation

Run the automated test suite:

```bash
npm run test --prefix server
```

---

## 📦 Production Build

To test and compile production bundles for deployment:

```bash
npm run build
```

- The client bundles into `client/dist/` (minified, tree-shaken, CSS purged).
- The server compiles into `server/dist/` (strict TypeScript validation).

---

## 🔒 Security Best Practices Implemented

- **Password Hashing:** Passwords hashed using `bcryptjs` with salt rounds.
- **SQL/NoSQL Injection Protection:** Queries validated and parameterized through Mongoose schemas.
- **Input Sanitization:** Express request bodies validated with strict rules.
- **Ownership Verification:** Teachers cannot edit, delete, or modify courses belonging to another teacher.
- **Enrollment Access Control:** Unenrolled users cannot access restricted learning videos or lesson resources.
- **Student Privacy:** Student accounts, emails, and learning histories are kept strictly private; only valid certificates are viewable through their unique verification ID.
- **Rate Limiting:** Protection enabled on `/api/auth/login` and `/api/auth/forgot-password`.
- **Security Headers:** Configured with `helmet` with appropriate CORS and cross-origin resource policy.
