# Project Request Approval Workflow

## Overview
This document describes the complete project request approval workflow that enables users to request projects, admins to approve them with contractor assignment, and automatic chat creation.

## Workflow Steps

### 1. User Creates Project Request
**Route:** `POST /api/projects`
**User Role:** `user`
**Status:** `pending` (initial)
**Approval Status:** `pending`

```javascript
Request:
{
  title: "Home Renovation Project",
  description: "Complete renovation of residential property",
  budget: 500000,
  location: "Chennai, Tamil Nadu",
  estimatedDuration: 45,
  timeline: "3 months",
  type: "Residential",
  requirements: ["Plumbing", "Electrical", "Painting"],
  notes: "Need to complete before monsoon"
}

Response:
{
  success: true,
  message: "Project created successfully",
  data: {
    project: {
      _id: "proj_123",
      userId: "user_456",
      title: "Home Renovation Project",
      status: "pending",
      approvalStatus: "pending",  // Key field
      budget: 500000,
      contractorId: null,  // Empty until approved
      conversationId: null, // Created on approval
      ...
    }
  }
}
```

### 2. Admin Sees Pending Projects
**Route:** `GET /api/projects/admin/pending`
**User Role:** `super_admin`

```javascript
Response:
{
  success: true,
  message: "Pending projects retrieved successfully",
  data: {
    projects: [
      {
        _id: "proj_123",
        userId: { name: "Arjun Kumar", email: "arjun@example.com" },
        title: "Home Renovation Project",
        description: "...",
        budget: 500000,
        location: "Chennai, Tamil Nadu",
        approvalStatus: "pending",
        createdAt: "2026-03-17T10:00:00Z"
      },
      ...
    ],
    total: 5
  }
}
```

### 3. Admin Reviews and Approves
**Route:** `POST /api/projects/:id/approve`
**User Role:** `super_admin`
**Required:** `contractorId` to assign

```javascript
Request:
{
  contractorId: "contractor_789"
}

Response:
{
  success: true,
  message: "Project approved successfully and conversation created",
  data: {
    project: {
      _id: "proj_123",
      userId: { name: "Arjun Kumar", email: "arjun@example.com" },
      contractorId: "contractor_789",
      title: "Home Renovation Project",
      status: "approved",
      approvalStatus: "approved",
      approvedBy: "admin_001",
      approvedAt: "2026-03-17T10:05:00Z",
      conversationId: "conv_555",  // AUTO-CREATED
      ...
    }
  }
}
```

### 4. Automatic Chat Creation
When a project is approved:
1. **Conversation Document Created** with fields:
   - `participants`: [userId, contractorId]
   - `projectId`: project._id
   - `subject`: "Project: {title}"
   - `isActive`: true
   - `createdAt`: timestamp

2. **Project Updated** with:
   - `conversationId`: reference to created conversation
   - `contractorId`: assigned contractor
   - `status`: "approved"
   - `approvalStatus`: "approved"

### 5. User and Contractor Chat
Both user and contractor can:
- Access the conversation through `/messages` route
- Send and receive messages
- Upload files/attachments
- See project-specific chat context
- Chat persists throughout project lifecycle

**Database Structure:**

```javascript
// Conversation Collection
{
  _id: ObjectId,
  participants: [userId, contractorId],
  projectId: projectId,  // Link to project
  subject: "Project: Home Renovation",
  messages: [
    {
      senderId: userId,
      senderName: "Arjun Kumar",
      text: "Hi! I've received your project...",
      timestamp: Date,
      attachments: []
    },
    ...
  ],
  isActive: true,
  createdAt: Date,
  updatedAt: Date
}
```

## Admin Rejection (Alternative)

**Route:** `POST /api/projects/:id/reject`
**User Role:** `super_admin`
**Required:** `rejectionReason`

```javascript
Request:
{
  rejectionReason: "Project budget is below our minimum threshold"
}

Response:
{
  success: true,
  message: "Project rejected successfully",
  data: {
    project: {
      _id: "proj_123",
      approvalStatus: "rejected",
      rejectionReason: "Project budget is below our minimum threshold",
      status: "cancelled",
      approvedAt: "2026-03-17T10:05:00Z",
      ...
    }
  }
}
```

## Database Schema Updates

### Project Model
```typescript
interface IProject extends Document {
  // ... existing fields
  
  // NEW APPROVAL FIELDS
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedBy?: ObjectId;        // Admin who approved
  approvedAt?: Date;            // Approval timestamp
  rejectionReason?: string;     // If rejected
  conversationId?: ObjectId;    // Link to auto-created chat
}
```

## Frontend Implementation

### AdminProjectApprovals Page
**Location:** `/admin/approvals`
**Component:** `AdminProjectApprovals.tsx`

**Features:**
- ✅ Display all pending projects in cards
- ✅ Show project details (title, budget, location, user)
- ✅ Approve button with contractor assignment
- ✅ Reject button with reason text area
- ✅ Real-time status updates
- ✅ Loading and error states

**Approval Flow:**
1. Admin views pending projects
2. Reviews project details
3. Selects "Approve" or "Reject"
4. If approve: automatically assigns a contractor
5. If reject: requires rejection reason
6. Chat is created immediately on approval
7. Both user and contractor notified

## Key Features

### ✅ Automatic Contractor Assignment
- Admin selects contractor during approval
- Contractor is linked to project
- Contractor receives notification

### ✅ Automatic Chat Creation
- Conversation created when project approved
- Both user and contractor added as participants
- Chat persists for project lifetime
- Project context available in chat

### ✅ Status Tracking
- Projects have two status fields:
  - `status`: 'pending' → 'approved' → 'in_progress' → 'completed'
  - `approvalStatus`: 'pending' → 'approved' or 'rejected'

### ✅ Admin Control
- Only super_admin can approve/reject
- Approval creates permanent connection
- Rejection reason tracked for records

### ✅ User Notification
- Users receive confirmation when project approved
- Contractor assignment notified
- Chat link provided automatically

## API Endpoints

| Method | Route | Permission | Purpose |
|--------|-------|-----------|---------|
| POST | `/api/projects` | user | Create project request |
| GET | `/api/projects/admin/pending` | super_admin | View pending approvals |
| POST | `/api/projects/:id/approve` | super_admin | Approve & assign contractor |
| POST | `/api/projects/:id/reject` | super_admin | Reject request |
| GET | `/api/conversations` | any | View chats |
| POST | `/api/conversations/:id/messages` | participant | Send message |

## Testing the Workflow

### Step 1: Create Project (as User)
```bash
curl -X POST http://localhost:5000/api/projects \
  -H "Authorization: Bearer USER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Kitchen Renovation",
    "description": "Complete kitchen makeover...",
    "budget": 400000,
    "location": "Bangalore, Karnataka",
    "estimatedDuration": 30,
    "timeline": "1 month",
    "type": "Residential"
  }'
```

### Step 2: View Pending (as Admin)
```bash
curl http://localhost:5000/api/projects/admin/pending \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

### Step 3: Approve Project (as Admin)
```bash
curl -X POST http://localhost:5000/api/projects/proj_123/approve \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "contractorId": "contractor_456"
  }'
```

### Step 4: Access Chat (as User or Contractor)
User navigates to `/user/chat` or Contractor to `/contractor/chat`
Both see the conversation created automatically in Step 3

## Summary

This workflow ensures:
- ✅ All projects go through admin approval
- ✅ Contractors are officially assigned via approval
- ✅ Communication channel established automatically
- ✅ Professional project handoff process
- ✅ Audit trail of approvals
- ✅ Persistent project-specific chat
