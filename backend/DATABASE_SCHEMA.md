# NEXA INFRA - MongoDB Collections Structure

## 📊 Complete Database Schema

### **Collections Overview**

| Collection | Purpose | Key Features |
|-----------|---------|--------------|
| `users` | User accounts (all roles) | Email-role locking, authentication |
| `contractors` | Contractor profiles | Specialties, ratings, portfolio |
| `projects` | Construction projects | Status tracking, milestones |
| `conversations` | Personalized chats | User-contractor messaging |
| `reviews` | Ratings & feedback | User ↔ Contractor reviews |
| `payments` | Transaction records | Stripe integration, invoices |
| `notifications` | User notifications | Real-time updates, personalized |
| `disputes` | Dispute management | Evidence tracking, resolution |
| `usercontractormappings` | User-contractor relationships | Favorites, blocked, history |
| `analytics` | Personalized metrics | Charts, statistics, performance |

---

## 1️⃣ Users Collection (`users`)

**Purpose**: Store all user accounts (users, contractors, admins)

```typescript
{
  _id: ObjectId
  email: string (unique, lowercase)
  password: string (hashed)
  name: string
  role: 'user' | 'contractor' | 'admin'
  phone?: string
  avatar?: string
  location?: string
  isVerified: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

**Key Features**:
- Email-based authentication with bcrypt
- Admin email locked to: `aamanojkumar190@gmail.com`
- Role-based access control
- Auto-password hashing on save

**Indexes**: `email`, `role`, `isActive`

---

## 2️⃣ Contractors Collection (`contractors`)

**Purpose**: Extended profiles for contractor users

```typescript
{
  _id: ObjectId
  userId: ObjectId → users._id (unique)
  company?: string
  specialties: [string] (required)
  bio?: string
  experience: number (years)
  rating: number (0-5)
  totalProjects: number
  completionRate: number (0-100)
  portfolio: [{
    title: string
    description: string
    image: string
    completedDate: Date
  }]
  certifications: [{
    name: string
    issuer: string
    date: Date
    document?: string
  }]
  availability: 'available' | 'busy' | 'unavailable'
  hourlyRate?: number
  isVerified: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

**Key Features**:
- One contractor profile per user
- Portfolio showcase
- Certification tracking
- Availability status

**Indexes**: `userId`, `specialties`, `rating`, `isVerified+isActive`

---

## 3️⃣ Projects Collection (`projects`)

**Purpose**: Track construction projects from creation to completion

```typescript
{
  _id: ObjectId
  userId: ObjectId → users._id
  contractorId?: ObjectId → contractors._id
  title: string
  description: string
  type: string (e.g., "Residential", "Commercial")
  budget: number
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'disputed' | 'cancelled'
  startDate?: Date
  endDate?: Date
  estimatedDuration: number (days)
  location: string
  requirements: [string]
  attachments: [string]
  progress: number (0-100)
  milestones: [{
    title: string
    description: string
    dueDate: Date
    isCompleted: boolean
    completedDate?: Date
  }]
  timeline: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}
```

**Key Features**:
- Complete project lifecycle management
- Milestone tracking
- Progress monitoring
- Multi-status workflow

**Indexes**: `userId+status`, `contractorId+status`, `status+createdAt`

---

## 4️⃣ Conversations Collection (`conversations`)

**Purpose**: Personalized chat system between users and contractors

```typescript
{
  _id: ObjectId
  userId: ObjectId → users._id
  contractorId: ObjectId → contractors._id
  projectId?: ObjectId → projects._id
  messages: [{
    senderId: ObjectId → users._id
    message: string
    timestamp: Date
    isRead: boolean
    attachments?: [string]
  }]
  lastMessage?: string
  lastMessageTime?: Date
  unreadCount: {
    user: number
    contractor: number
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

**Key Features**:
- Real-time messaging
- Unread count per participant
- Message attachments support
- Project-linked conversations

**Indexes**: `userId+contractorId`, `userId+isActive`, `contractorId+isActive`, `lastMessageTime`

---

## 5️⃣ Reviews Collection (`reviews`)

**Purpose**: Bidirectional reviews between users and contractors

```typescript
{
  _id: ObjectId
  projectId: ObjectId → projects._id
  userId: ObjectId → users._id
  contractorId: ObjectId → contractors._id
  rating: number (1-5, required)
  comment: string
  reviewType: 'user_to_contractor' | 'contractor_to_user'
  aspects?: {
    quality: number (1-5)
    communication: number (1-5)
    timeliness: number (1-5)
    professionalism: number (1-5)
  }
  isVerified: boolean
  isPublic: boolean
  response?: {
    message: string
    respondedAt: Date
  }
  helpful: {
    count: number
    users: [ObjectId]
  }
  createdAt: Date
  updatedAt: Date
}
```

**Key Features**:
- Aspect-based ratings
- Review responses
- Verified reviews
- Helpful voting system
- One review per user per project (unique index)

**Indexes**: `contractorId+isPublic`, `userId`, `projectId`, `rating`, `userId+projectId+reviewType (unique)`

---

## 6️⃣ Payments Collection (`payments`)

**Purpose**: Track all financial transactions

```typescript
{
  _id: ObjectId
  projectId: ObjectId → projects._id
  userId: ObjectId → users._id
  contractorId: ObjectId → contractors._id
  amount: number
  currency: string (default: 'USD')
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'disputed'
  paymentMethod: 'card' | 'bank_transfer' | 'wallet' | 'stripe'
  stripePaymentIntentId?: string
  stripeChargeId?: string
  description: string
  metadata?: {
    milestone?: string
    phase?: string
    notes?: string
  }
  paidAt?: Date
  refundedAt?: Date
  refundAmount?: number
  refundReason?: string
  transactionFee: number
  netAmount: number (auto-calculated)
  receiptUrl?: string
  invoiceNumber: string (unique)
  createdAt: Date
  updatedAt: Date
}
```

**Key Features**:
- Stripe integration ready
- Auto-calculate net amount (amount - fees)
- Invoice generation
- Refund tracking
- Payment status workflow

**Indexes**: `userId+status`, `contractorId+status`, `projectId`, `invoiceNumber (unique)`, `stripePaymentIntentId`

---

## 7️⃣ Notifications Collection (`notifications`)

**Purpose**: Personalized notifications for each user

```typescript
{
  _id: ObjectId
  userId: ObjectId → users._id
  type: 'project_update' | 'message' | 'payment' | 'review' | 'contractor_assigned' 
        | 'project_completed' | 'dispute' | 'system' | 'milestone_reached'
  title: string
  message: string
  data?: {
    projectId?: ObjectId
    contractorId?: ObjectId
    paymentId?: ObjectId
    conversationId?: ObjectId
    reviewId?: ObjectId
    actionUrl?: string
  }
  isRead: boolean
  isArchived: boolean
  priority: 'low' | 'medium' | 'high' | 'urgent'
  expiresAt?: Date (auto-delete via TTL)
  createdAt: Date
  updatedAt: Date
}
```

**Key Features**:
- Type-based notifications
- Priority levels
- Deep linking to resources
- Auto-expiration (TTL index)
- Read/archive status

**Indexes**: `userId+isRead+isArchived`, `userId+createdAt`, `expiresAt (TTL)`

---

## 8️⃣ Disputes Collection (`disputes`)

**Purpose**: Handle project disputes and resolutions

```typescript
{
  _id: ObjectId
  projectId: ObjectId → projects._id
  raisedBy: ObjectId → users._id
  raisedAgainst: ObjectId → users._id
  title: string
  description: string
  category: 'payment' | 'quality' | 'delay' | 'communication' | 'contract_breach' | 'other'
  status: 'open' | 'under_review' | 'resolved' | 'closed' | 'escalated'
  priority: 'low' | 'medium' | 'high' | 'critical'
  evidence: [{
    type: 'image' | 'document' | 'video'
    url: string
    description?: string
    uploadedAt: Date
  }]
  timeline: [{
    action: string
    performedBy: ObjectId → users._id
    notes?: string
    timestamp: Date
  }]
  resolution?: {
    resolvedBy: ObjectId → users._id
    resolution: string
    compensation?: number
    resolvedAt: Date
  }
  adminNotes?: string
  createdAt: Date
  updatedAt: Date
}
```

**Key Features**:
- Evidence upload system
- Timeline tracking
- Admin resolution workflow
- Compensation tracking
- Priority management

**Indexes**: `projectId`, `raisedBy+status`, `raisedAgainst+status`, `status+priority`

---

## 9️⃣ UserContractorMappings Collection (`usercontractormappings`)

**Purpose**: Track user-contractor relationships and history

```typescript
{
  _id: ObjectId
  userId: ObjectId → users._id
  contractorId: ObjectId → contractors._id
  isFavorite: boolean
  isBlocked: boolean
  tags: [string] (e.g., ["plumbing", "reliable"])
  notes?: string
  lastInteraction?: Date
  projectsCompleted: number
  totalSpent: number
  rating?: number
  customData?: {
    preferredForCategories?: [string]
    communicationPreference?: 'email' | 'phone' | 'chat'
    [key: string]: any
  }
  createdAt: Date
  updatedAt: Date
}
```

**Key Features**:
- Favorite contractors feature
- Block list management
- Personal tags/notes
- Relationship history
- One mapping per user-contractor pair (unique index)

**Indexes**: `userId+contractorId (unique)`, `userId+isFavorite`, `userId+isBlocked`, `userId+lastInteraction`

---

## 🔟 Analytics Collection (`analytics`)

**Purpose**: Personalized statistics and charts for each user

```typescript
{
  _id: ObjectId
  userId: ObjectId → users._id
  userType: 'user' | 'contractor' | 'admin'
  period: 'daily' | 'weekly' | 'monthly' | 'yearly'
  periodDate: Date (start of period)
  
  projectMetrics: {
    totalProjects: number
    activeProjects: number
    completedProjects: number
    cancelledProjects: number
    pendingProjects: number
    averageProjectValue: number
    averageCompletionTime: number
  }
  
  financialMetrics: {
    totalRevenue: number
    totalSpent: number
    pendingPayments: number
    completedPayments: number
    averageTransactionValue: number
    totalTransactionFees: number
  }
  
  performanceMetrics: {
    averageRating: number
    totalReviews: number
    completionRate: number
    responseTime: number
    disputeRate: number
    onTimeDeliveryRate: number
  }
  
  engagementMetrics: {
    totalMessages: number
    newConversations: number
    profileViews?: number
    projectInquiries?: number
    contractorSearches?: number
  }
  
  chartData?: {
    revenueByMonth?: [{ month: string, amount: number }]
    projectsByStatus?: [{ status: string, count: number }]
    topContractors?: [{ contractorId: ObjectId, spent: number }]
    topCategories?: [{ category: string, count: number }]
    [key: string]: any
  }
  
  createdAt: Date
  updatedAt: Date
}
```

**Key Features**:
- Time-series analytics per period
- Comprehensive metrics tracking
- Custom chart data storage
- One record per user per period (unique index)

**Indexes**: `userId+period+periodDate (unique)`, `userId+periodDate`, `userType+period`

---

## 🔗 Relationships Diagram

```
USER (users)
  ├── has one → CONTRACTOR (contractors)
  ├── creates many → PROJECTS (projects)
  ├── has many → CONVERSATIONS (conversations)
  ├── writes many → REVIEWS (reviews)
  ├── makes many → PAYMENTS (payments)
  ├── receives many → NOTIFICATIONS (notifications)
  ├── raises/has many → DISPUTES (disputes)
  ├── maps to many → USERCONTRACTORMAPPINGS (usercontractormappings)
  └── has many → ANALYTICS (analytics)

CONTRACTOR (contractors)
  ├── receives many → PROJECTS (projects)
  ├── has many → CONVERSATIONS (conversations)
  ├── receives many → REVIEWS (reviews)
  └── receives many → PAYMENTS (payments)

PROJECT (projects)
  ├── has many → PAYMENTS (payments)
  ├── has many → REVIEWS (reviews)
  ├── has one → CONVERSATION (conversations)
  └── may have → DISPUTES (disputes)
```

---

## 📈 Data Flow Examples

### User Workflow:
1. **User registers** → `users` collection
2. **Searches contractors** → query `contractors` collection
3. **Favorites a contractor** → create `usercontractormappings` record
4. **Creates project request** → create `projects` record
5. **Chats with contractor** → create `conversations` + `messages`
6. **Makes payment** → create `payments` record
7. **Receives notification** → create `notifications` record
8. **Leaves review** → create `reviews` record
9. **Views dashboard** → query `analytics` collection

### Contractor Workflow:
1. **Registers as contractor** → create `users` + `contractors` records
2. **Gets project assignment** → update `projects.contractorId`
3. **Chats with client** → update `conversations`
4. **Receives payment** → `payments` status → `completed`
5. **Gets reviewed** → `reviews` created
6. **Views analytics** → query `analytics` for performance metrics

### Admin Workflow:
1. **Monitors all projects** → query `projects` by status
2. **Handles disputes** → query `disputes`, update resolution
3. **Reviews payments** → query `payments` by status
4. **Views platform analytics** → aggregate `analytics` across all users

---

## 🎯 Summary

**Total Collections**: 10

✅ **User-specific**:
- Personal details (users)
- Notifications (personalized)
- Analytics (charts & metrics per user)
- Contractor mappings (favorites, blocked)

✅ **Contractor-specific**:
- Profile (contractors)
- Portfolio & certifications
- Analytics (performance metrics)

✅ **Interaction-based**:
- Conversations (personalized chats)
- Reviews (bidirectional feedback)
- Payments (transaction history)
- Projects (full lifecycle)
- Disputes (resolution tracking)

✅ **All data is personalized** per user via userId field and proper indexing for fast queries!
