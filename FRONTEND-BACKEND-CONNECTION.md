# NEXA-INFRA Frontend-Backend Connection Architecture

## OVERVIEW: How Frontend & Backend Communicate

```
FRONTEND (React/Vite)              BACKEND (Node.js/Express)
       ↓                                   ↓
   Port 8080                          Port 5000
   (http://localhost:8080)        (http://localhost:5000/api)
       ↓                                   ↓
  Makes HTTP Requests        ← → Receives & Responds with JSON
  (via Axios)                        (via Express Routes)
       ↓                                   ↓
 Stores tokens in                  Stores data in MongoDB
 localStorage                       with JWT Auth
```

---

## 1. CONNECTION FILES

### **FRONTEND - API Configuration**
**File:** `frontend/src/services/api.ts`
```typescript
// Line 26-27: Backend URL Configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// This file creates an axios client for all HTTP requests
// Every API call goes through this configured axios instance
```

### **FRONTEND - Environment Variables**
**File:** `frontend/.env` (or set in vite.config.ts)
```
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_TIMEOUT=10000
```

### **BACKEND - Server Setup**
**File:** `backend/src/server.ts`
```typescript
// Line 15-16: Server Configuration
const app: Application = express();
const PORT = process.env.PORT || 5000;

// Line 36-38: CORS Configuration (allows frontend to connect)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));

// Line 65-73: Routes Registration (handles incoming requests)
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/contractors', contractorRoutes);
// ... more routes
```

### **BACKEND - Environment Variables**
**File:** `backend/.env`
```
PORT=5000
MONGODB_URI=mongodb+srv://...
FRONTEND_URL=http://localhost:8080
ADMIN_EMAIL=aamanojkumar190@gmail.com
JWT_SECRET=your_jwt_secret
```

---

## 2. AUTHENTICATION FLOW (Complete Example)

### **Step 1: User Submits Login Form (Frontend)**
**File:** `frontend/src/contexts/AuthContext.tsx` (Lines 61-94)
```typescript
const login = useCallback(async (email: string, password: string): Promise<boolean> => {
  try {
    // 🔹 FRONTEND MAKES POST REQUEST TO BACKEND
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });

    const { data } = response.data;
    
    // 🔹 FRONTEND STORES TOKEN & USER IN LOCALSTORAGE
    localStorage.setItem(TOKEN_KEY, data.token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    
    return true;
  } catch (err) {
    setError(message);
    return false;
  }
}, []);
```

### **Step 2: Backend Receives & Processes (Backend)**
**File:** `backend/src/routes/auth.routes.ts` (Lines 16-19)
```typescript
// Route definition
router.post('/login', login);
```

**File:** `backend/src/controllers/auth.controller.ts` (Lines 89-135)
```typescript
export const login = catchAsync(
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const { email, password } = req.body;  // 🔹 RECEIVES DATA FROM FRONTEND

    // Find user in MongoDB
    const user = await User.findOne({ 
      email: email.toLowerCase() 
    }).select('+password');

    // Verify password using bcryptjs
    const isPasswordValid = await user.comparePassword(password);

    // Generate JWT token
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    // 🔹 SEND JSON RESPONSE BACK TO FRONTEND
    res.status(200).json({
      success: true,
      data: {
        user: { id, email, name, role },
        token: token,
      },
    });
  }
);
```

### **Step 3: Frontend Uses Token for Protected Requests**
**File:** `frontend/src/services/api.ts` (Lines 50-70)
```typescript
// Axios interceptor automatically adds token to every request
requestInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 3. PROJECT REQUEST FLOW (Complete Example)

### **Step 1: User Submits Project Request (Frontend)**
**File:** `frontend/src/components/ContractorCard.tsx` (Lines 50-80)
```typescript
const handleSubmitRequest = async (e: React.FormEvent) => {
  const newProject = {
    id: Date.now().toString(),
    title: formData.title,
    description: formData.description,
    budget: parseFloat(formData.budget),
    userId: user?.id,        // 🔹 LINKS REQUEST TO USER
    userName: user?.name,
    status: "pending",
    approvalStatus: "pending",
  };

  // 🔹 SAVE TO LOCALSTORAGE (acts like database during development)
  projectRequests.push(newProject);
  localStorage.setItem("user_project_requests", JSON.stringify(projectRequests));
};
```

### **Step 2: Admin Reviews in Dashboard (Frontend)**
**File:** `frontend/src/pages/admin/AdminProjectApprovals.tsx` (Lines 60-90)
```typescript
const fetchPendingProjects = async () => {
  // 🔹 GET REQUESTS FROM LOCALSTORAGE
  const storedProjects = localStorage.getItem("user_project_requests");
  const userRequests = storedProjects ? JSON.parse(storedProjects) : [];

  // Filter for pending projects
  const mockPendingProjects = [
    ...MOCK_PROJECTS,
    ...userRequests  // 🔹 COMBINE MOCK + USER REQUESTS
  ].filter(p => !p.contractorId);

  setProjects(mockPendingProjects);
};
```

### **Step 3: Admin Approves & Assigns (Frontend)**
**File:** `frontend/src/pages/admin/AdminProjectApprovals.tsx` (Lines 111-155)
```typescript
const handleApprove = async (projectId: string) => {
  const randomContractor = MOCK_CONTRACTORS[...];

  // 🔹 CREATE CONVERSATION (chat between user & contractor)
  const newConversation = {
    id: `conv-${Date.now()}`,
    projectId: projectId,
    userId: originalProject.userId,
    contractorId: randomContractor.userId,
    messages: [],
  };

  // 🔹 SAVE CONVERSATION & UPDATE PROJECT
  conversationsList.push(newConversation);
  localStorage.setItem("conversations", JSON.stringify(conversationsList));

  updatedUserRequests = userRequests.map(p => 
    p.id === projectId 
      ? {
          ...p,
          contractorId: randomContractor.id,  // 🔹 ASSIGN CONTRACTOR
          approvalStatus: "approved",          // 🔹 CHANGE STATUS
          conversationId: newConversation.id,
        }
      : p
  );

  localStorage.setItem("user_project_requests", JSON.stringify(updatedUserRequests));
};
```

---

## 4. DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Components (ContractorCard, AdminProjectApprovals, etc)   │ │
│ ├────────────────────────────────────────────────────────────┤ │
│ │ Services: api.ts, auth.ts, project.ts                     │ │
│ │ ├─ HTTP Requests via Axios                                │ │
│ │ ├─ POST /api/auth/login (with email/password)             │ │
│ │ └─ GET /api/auth/me (with JWT token)                      │ │
│ ├────────────────────────────────────────────────────────────┤ │
│ │ Local Storage (Development):                              │ │
│ │ ├─ nexa_auth_token (JWT)                                  │ │
│ │ ├─ user_project_requests (project data)                   │ │
│ │ └─ conversations (chat data)                              │ │
│ └────────────────────────────────────────────────────────────┘ │
└───────────────────────┬───────────────────────────────────────┘
                        │ HTTP Requests (JSON)
                        │ axios.post/get/put/delete
                        ↓
┌─────────────────────────────────────────────────────────────────┐
│                      BACKEND (Express.js)                        │
│ ┌────────────────────────────────────────────────────────────┐ │
│ │ Routes:                                                    │ │
│ │ ├─ POST /api/auth/login → controllers/auth.controller.ts │ │
│ │ ├─ GET /api/auth/me → middleware/auth.middleware.ts      │ │
│ │ └─ POST /api/projects/approve → controllers/project.ts   │ │
│ ├────────────────────────────────────────────────────────────┤ │
│ │ Middleware:                                                │ │
│ │ ├─ CORS (allows requests from localhost:8080)             │ │
│ │ ├─ Authentication (verifies JWT token)                    │ │
│ │ ├─ Error Handling (catches exceptions)                    │ │
│ ├────────────────────────────────────────────────────────────┤ │
│ │ Database:                                                  │ │
│ │ ├─ MongoDB with Mongoose                                  │ │
│ │ ├─ Collections: User, Project, Conversation, etc          │ │
│ │ └─ Password hashing with bcryptjs                         │ │
│ └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. KEY CONNECTION FILES - QUICK REFERENCE

| Component | Frontend File | Backend File | Connection |
|-----------|--------------|------------|-----------|
| **Authentication** | `contexts/AuthContext.tsx` | `controllers/auth.controller.ts` | POST `/api/auth/login` |
| **API Client** | `services/api.ts` | `server.ts` | Axios to Express |
| **Project Routes** | `pages/admin/AdminProjectApprovals.tsx` | `routes/project.routes.ts` | POST `/api/projects/approve` |
| **User Model** | `types/index.ts` | `models/User.ts` | User data structure |
| **Contractors** | `services/contractor.ts` | `routes/contractor.routes.ts` | GET `/api/contractors` |
| **Conversations** | `pages/Messages.tsx` | `routes/conversation.routes.ts` | WebSocket + REST |
| **Token Storage** | `localStorage` | `middleware/auth.middleware.ts` | JWT verification |
| **Environment** | `.env` (frontend) | `.env` (backend) | `VITE_API_BASE_URL` |

---

## 6. REQUEST-RESPONSE EXAMPLE

### **Login Request**

**Frontend Sends:**
```json
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Backend Responds:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Frontend Stores:**
```javascript
localStorage.setItem('nexa_auth_token', token);
localStorage.setItem('nexa_auth_user', JSON.stringify(user));
```

**Future Requests Include:**
```javascript
headers: {
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 7. CORS & Security

**CORS Configuration (backend allows frontend to connect)**
**File:** `backend/src/server.ts` (Lines 36-38)
```typescript
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
}));
```

This tells backend: "Allow requests from frontend at http://localhost:8080"

---

## 8. How to Run Both Together

### **Terminal 1 - Start Backend:**
```bash
cd backend
npm install
npm run dev
# Server runs at http://localhost:5000/api
```

### **Terminal 2 - Start Frontend:**
```bash
cd frontend
npm install
npm run dev
# Frontend runs at http://localhost:8080
# Environment variable: VITE_API_BASE_URL=http://localhost:5000/api
```

---

## SUMMARY: Connection Points

1. ✅ **Frontend makes HTTP requests** via `axios` to backend URLs
2. ✅ **Backend listens on port 5000** with Express routes
3. ✅ **CORS enabled** to allow localhost:8080 → localhost:5000
4. ✅ **JWT tokens** used for authentication on protected routes
5. ✅ **MongoDB** stores persistent data (User, Project, Conversation models)
6. ✅ **localStorage** caches tokens & user data on frontend
7. ✅ **Environment variables** (`VITE_API_BASE_URL`, `PORT`, etc) configure connection

---

**For Viva: These are the exact files to reference when explaining frontend-backend connection!**
