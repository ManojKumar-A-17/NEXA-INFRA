# NEXA INFRA - API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
Most endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /api/auth/register
```
**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "user" // or "contractor"
}
```

### Login
```http
POST /api/auth/login
```
**Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Get Current User
```http
GET /api/auth/me
```
**Headers:** `Authorization: Bearer <token>`

### Logout
```http
POST /api/auth/logout
```
**Headers:** `Authorization: Bearer <token>`

---

## 📋 Project Endpoints

### Create Project
```http
POST /api/projects
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "title": "Home Renovation",
  "description": "Complete kitchen remodel",
  "type": "residential",
  "budget": 50000,
  "location": {
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  },
  "timeline": {
    "startDate": "2024-04-01",
    "endDate": "2024-06-30"
  }
}
```

### Get All Projects
```http
GET /api/projects?status=pending&contractorId=xxx
```
**Headers:** `Authorization: Bearer <token>`
**Query Params:**
- `status`: Filter by status (pending, approved, in_progress, completed, cancelled)
- `contractorId`: Filter by contractor ID

### Get Single Project
```http
GET /api/projects/:id
```
**Headers:** `Authorization: Bearer <token>`

### Update Project
```http
PUT /api/projects/:id
```
**Headers:** `Authorization: Bearer <token>`
**Body:** (partial update)
```json
{
  "title": "Updated Title",
  "budget": 55000
}
```

### Delete Project
```http
DELETE /api/projects/:id
```
**Headers:** `Authorization: Bearer <token>`

### Update Project Status
```http
PUT /api/projects/:id/status
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "status": "in_progress"
}
```

### Assign Contractor
```http
POST /api/projects/:id/assign
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "contractorId": "contractor_id_here"
}
```

### Add Milestone
```http
POST /api/projects/:id/milestones
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "name": "Foundation Complete",
  "description": "Complete foundation work",
  "dueDate": "2024-05-01",
  "payment": 10000
}
```

### Update Milestone
```http
PUT /api/projects/:id/milestones/:milestoneIndex
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "status": "completed"
}
```

---

## 👷 Contractor Endpoints

### Browse Contractors (Public)
```http
GET /api/contractors?specialty=plumbing&minRating=4&page=1&limit=10
```
**Query Params:**
- `specialty`: Filter by specialty
- `minRating`: Minimum rating (0-5)
- `available`: Filter available contractors
- `search`: Search in company name/bio
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Get Contractor Profile (Public)
```http
GET /api/contractors/:id
```

### Get Favorite Contractors
```http
GET /api/contractors/favorites
```
**Headers:** `Authorization: Bearer <token>`

### Update Contractor Profile
```http
PUT /api/contractors/:id
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "company": "Updated Company Name",
  "bio": "Updated bio",
  "specialties": ["plumbing", "electrical"]
}
```

### Add Portfolio Item
```http
POST /api/contractors/:id/portfolio
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "title": "Kitchen Remodel",
  "description": "Modern kitchen renovation",
  "images": ["url1", "url2"],
  "completionDate": "2024-01-15"
}
```

### Add Certification
```http
POST /api/contractors/:id/certifications
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "name": "Licensed Plumber",
  "issuedBy": "State Board",
  "issueDate": "2020-01-01",
  "expiryDate": "2025-01-01",
  "certificateUrl": "url_here"
}
```

### Toggle Favorite
```http
POST /api/contractors/:id/favorite
```
**Headers:** `Authorization: Bearer <token>`

### Toggle Block
```http
POST /api/contractors/:id/block
```
**Headers:** `Authorization: Bearer <token>`

---

## 💬 Conversation/Chat Endpoints

### Get All Conversations
```http
GET /api/conversations
```
**Headers:** `Authorization: Bearer <token>`

### Create Conversation
```http
POST /api/conversations
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "contractorId": "contractor_id",
  "projectId": "project_id",
  "message": "Initial message"
}
```

### Get Conversation with Messages
```http
GET /api/conversations/:id
```
**Headers:** `Authorization: Bearer <token>`

### Send Message
```http
POST /api/conversations/:id/messages
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "message": "Your message here",
  "attachments": ["url1", "url2"]
}
```

### Mark as Read
```http
PUT /api/conversations/:id/read
```
**Headers:** `Authorization: Bearer <token>`

### Archive Conversation
```http
DELETE /api/conversations/:id
```
**Headers:** `Authorization: Bearer <token>`

---

## 💳 Payment Endpoints

### Create Payment Intent
```http
POST /api/payments/create-intent
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "projectId": "project_id",
  "amount": 5000,
  "description": "Milestone 1 payment",
  "milestoneId": "milestone_id"
}
```

### Confirm Payment
```http
POST /api/payments/:id/confirm
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "transactionId": "stripe_transaction_id"
}
```

### Get Payments
```http
GET /api/payments?status=completed&projectId=xxx
```
**Headers:** `Authorization: Bearer <token>`
**Query Params:**
- `status`: Filter by status
- `projectId`: Filter by project

### Get Payment Analytics
```http
GET /api/payments/analytics
```
**Headers:** `Authorization: Bearer <token>`

### Get Single Payment
```http
GET /api/payments/:id
```
**Headers:** `Authorization: Bearer <token>`

### Request Refund
```http
POST /api/payments/:id/refund
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "reason": "Reason for refund"
}
```

### Process Refund (Admin Only)
```http
POST /api/payments/:id/process-refund
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "approved": true,
  "adminNotes": "Refund approved"
}
```

### Stripe Webhook
```http
POST /api/payments/webhook
```
**Headers:** `stripe-signature: <signature>`

---

## ⭐ Review Endpoints

### Create Review
```http
POST /api/reviews
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "projectId": "project_id",
  "contractorId": "contractor_id",
  "rating": 5,
  "comment": "Excellent work!",
  "reviewType": "user_to_contractor",
  "aspects": {
    "quality": 5,
    "communication": 5,
    "timeliness": 4,
    "professionalism": 5
  }
}
```

### Get Contractor Reviews (Public)
```http
GET /api/reviews/contractor/:contractorId
```

### Get Single Review (Public)
```http
GET /api/reviews/:id
```

### Update Review
```http
PUT /api/reviews/:id
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "rating": 4,
  "comment": "Updated review"
}
```

### Respond to Review (Contractor Only)
```http
POST /api/reviews/:id/response
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "message": "Thank you for your feedback!"
}
```

### Mark Review as Helpful
```http
POST /api/reviews/:id/helpful
```
**Headers:** `Authorization: Bearer <token>`

### Delete Review
```http
DELETE /api/reviews/:id
```
**Headers:** `Authorization: Bearer <token>`

---

## ⚖️ Dispute Endpoints

### Create Dispute
```http
POST /api/disputes
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "projectId": "project_id",
  "subject": "Payment dispute",
  "description": "Detailed description",
  "category": "payment",
  "evidence": [
    {
      "type": "image",
      "url": "evidence_url",
      "description": "Evidence description"
    }
  ]
}
```

### Get Disputes
```http
GET /api/disputes?status=open&category=payment
```
**Headers:** `Authorization: Bearer <token>`
**Query Params:**
- `status`: Filter by status
- `category`: Filter by category
- `projectId`: Filter by project

### Get Single Dispute
```http
GET /api/disputes/:id
```
**Headers:** `Authorization: Bearer <token>`

### Update Dispute
```http
PUT /api/disputes/:id
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "description": "Updated description"
}
```

### Add Evidence
```http
POST /api/disputes/:id/evidence
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "type": "document",
  "url": "evidence_url",
  "description": "Additional evidence"
}
```

### Update Dispute Status (Admin Only)
```http
PUT /api/disputes/:id/status
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "status": "under_review"
}
```

### Resolve Dispute (Admin Only)
```http
POST /api/disputes/:id/resolve
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "resolution": "Resolution details",
  "favoredParty": "user",
  "adminNotes": "Admin notes"
}
```

---

## 🔔 Notification Endpoints

### Get Notifications
```http
GET /api/notifications?type=payment&isRead=false
```
**Headers:** `Authorization: Bearer <token>`
**Query Params:**
- `type`: Filter by type
- `priority`: Filter by priority
- `isRead`: Filter by read status
- `page`: Page number
- `limit`: Items per page

### Get Notification Settings
```http
GET /api/notifications/settings
```
**Headers:** `Authorization: Bearer <token>`

### Mark All as Read
```http
PUT /api/notifications/read-all
```
**Headers:** `Authorization: Bearer <token>`

### Archive All Read
```http
DELETE /api/notifications/archive-all
```
**Headers:** `Authorization: Bearer <token>`

### Create Notification (Admin Only)
```http
POST /api/notifications
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "userId": "user_id",
  "type": "system",
  "title": "Important Update",
  "message": "Please update your profile",
  "priority": "high"
}
```

### Get Single Notification
```http
GET /api/notifications/:id
```
**Headers:** `Authorization: Bearer <token>`

### Mark as Read
```http
PUT /api/notifications/:id/read
```
**Headers:** `Authorization: Bearer <token>`

### Archive Notification
```http
DELETE /api/notifications/:id
```
**Headers:** `Authorization: Bearer <token>`

---

## 👨‍💼 Admin Endpoints

**All admin endpoints require admin role authentication**

### Get Platform Analytics
```http
GET /api/admin/analytics
```
**Headers:** `Authorization: Bearer <token>`

### Get All Users
```http
GET /api/admin/users?role=user&isActive=true&search=john
```
**Headers:** `Authorization: Bearer <token>`
**Query Params:**
- `role`: Filter by role
- `isActive`: Filter by active status
- `search`: Search by name/email

### Get User by ID
```http
GET /api/admin/users/:id
```
**Headers:** `Authorization: Bearer <token>`

### Update User Status
```http
PUT /api/admin/users/:id/status
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "isActive": false
}
```

### Delete User
```http
DELETE /api/admin/users/:id
```
**Headers:** `Authorization: Bearer <token>`

### Get All Contractors
```http
GET /api/admin/contractors?isVerified=false
```
**Headers:** `Authorization: Bearer <token>`

### Verify Contractor
```http
PUT /api/admin/contractors/:id/verify
```
**Headers:** `Authorization: Bearer <token>`
**Body:**
```json
{
  "isVerified": true,
  "verificationNotes": "All documents verified"
}
```

### Get All Projects
```http
GET /api/admin/projects?status=in_progress
```
**Headers:** `Authorization: Bearer <token>`

### Get All Payments
```http
GET /api/admin/payments?status=completed
```
**Headers:** `Authorization: Bearer <token>`

### Get All Disputes
```http
GET /api/admin/disputes?status=open
```
**Headers:** `Authorization: Bearer <token>`

---

## 📝 Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "stack": "Error stack trace (development only)"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "pages": 10
    }
  }
}
```

---

## 🚀 Testing the API

### Using cURL
```bash
# Health check
curl http://localhost:5000/health

# Register user
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","password":"password123","role":"user"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'

# Get projects (with token)
curl http://localhost:5000/api/projects \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using PowerShell
```powershell
# Health check
Invoke-WebRequest -Uri http://localhost:5000/health -UseBasicParsing

# Register user
$body = @{
    name = "John Doe"
    email = "john@example.com"
    password = "password123"
    role = "user"
} | ConvertTo-Json

Invoke-WebRequest -Uri http://localhost:5000/api/auth/register `
  -Method POST `
  -Body $body `
  -ContentType "application/json" `
  -UseBasicParsing
```

---

## 🔒 Authorization Roles

- **user**: Regular users who create projects
- **contractor**: Service providers who work on projects
- **admin**: Platform administrators with full access

---

## 📊 Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

---

**API Version:** 1.0.0  
**Last Updated:** March 5, 2026
