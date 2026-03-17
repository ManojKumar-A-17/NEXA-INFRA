# Real Contractor Database Seeding Guide

## Overview
This guide explains how to set up real contractor accounts in MongoDB using the seeding script.

## Prerequisites
- MongoDB running (local or cloud)
- Node.js installed
- Backend dependencies installed (`npm install`)

## Files Related to Contractor Authentication

### 1. **Mock Data** (Frontend)
- **File:** `frontend/src/data/mock.ts`
- **Contains:** 6 contractors with email and password fields
- **Purpose:** Frontend mock data for UI testing

### 2. **Database Seeding Script** (Backend)
- **File:** `backend/scripts/seedRealContractors.ts`
- **Purpose:** Seeds MongoDB with real contractor users
- **Creates:** User documents with hashed passwords + Contractor profiles

### 3. **Models**
- **User Model:** `backend/src/models/User.ts` - Handles authentication
- **Contractor Model:** `backend/src/models/Contractor.ts` - Contractor profile data

## Contractor Credentials

The following 6 contractors will be created:

| # | Email | Password | Company |
|---|-------|----------|---------|
| 1 | mohamadaadilj.23aid@kongu.edu | password1 | Raj & Associates Construction |
| 2 | meiajay@gmail.com | password2 | Keralam Infra Solutions |
| 3 | palani.pmp.ele@gmail.com | password3 | Bangalore Premier Builders |
| 4 | email4@gmail.com | password4 | Coimbatore Express Builders |
| 5 | email5@gmail.com | password5 | Thiruvananthapuram Modern Constructions |
| 6 | email6@gmail.com | password6 | Mysore Quality Projects |

## How to Seed the Database

### Step 1: Compile TypeScript
```bash
cd backend
npm run build
```

### Step 2: Run the Seeding Script
```bash
npm run seed:contractors
```

Or manually:
```bash
npx ts-node scripts/seedRealContractors.ts
```

### Step 3: Verify Results
If successful, you'll see:
```
✅ Connected to MongoDB
✅ Created Raj & Associates Construction
   📧 Email: mohamadaadilj.23aid@kongu.edu
   🔐 Password: password1
[... 5 more contractors ...]
✨ Seeding completed!
✅ Created: 6 contractors
⏭️  Skipped: 0 contractors (already exist)
```

## What Gets Created in MongoDB

### User Collection
```javascript
{
  "_id": ObjectId,
  "email": "mohamadaadilj.23aid@kongu.edu",
  "password": "$2a$10$hashed...", // bcrypt hashed
  "role": "contractor",
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

### Contractor Collection
```javascript
{
  "_id": ObjectId,
  "userId": ObjectId, // Reference to User
  "company": "Raj & Associates Construction",
  "specialties": ["Residential", "Interior Design", "Renovation"],
  "experience": 16,
  "rating": 4.9,
  "totalProjects": 98,
  "completionRate": 95,
  "hourlyRate": 850,
  "certifications": [...],
  "isVerified": true,
  "isActive": true,
  "availability": "available",
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

## Testing Login

After seeding, contractors can login with:
- **Email:** mohamadaadilj.23aid@kongu.edu
- **Password:** password1

The authentication system will:
1. Find User by email
2. Compare password using bcrypt
3. Generate JWT token
4. Link to Contractor profile via userId

## Environment Variables Needed

Create/update `.env` in backend folder:
```env
MONGODB_URI=mongodb://localhost:27017/nexa-infra
JWT_SECRET=your_jwt_secret_key
```

## Notes

- **Passwords are hashed** using bcryptjs (10 salt rounds)
- **Unique emails** - Script skips if email already exists
- **role: 'contractor'** - All created users have contractor role
- **isActive: true** - All contractors are active by default
- **isVerified: true** - All contractors are verified

## Troubleshooting

### "Cannot find module 'mongoose'"
```bash
npm install mongoose
```

### "Connection refused"
Make sure MongoDB is running:
```bash
mongod
```

### "Email already exists"
The script will skip if user already exists - this is normal on re-run.

## Next Steps

1. ✅ Contractors added to database
2. ✅ Passwords securely hashed
3. ✅ Ready for login/authentication testing
4. 🔄 Start backend server: `npm run dev`
5. 🔄 Test login with contractor credentials
