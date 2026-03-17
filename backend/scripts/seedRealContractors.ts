import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Define User Schema inline for seeding
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'contractor', 'super_admin'], default: 'contractor' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Define Contractor Schema inline for seeding
const contractorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  company: String,
  specialties: [String],
  bio: String,
  experience: Number,
  rating: Number,
  totalProjects: Number,
  completionRate: Number,
  portfolio: [
    {
      title: String,
      description: String,
      image: String,
      completedDate: Date,
    },
  ],
  certifications: [
    {
      name: String,
      issuer: String,
      date: Date,
      document: String,
    },
  ],
  availability: { type: String, enum: ['available', 'busy', 'unavailable'] },
  hourlyRate: Number,
  isVerified: Boolean,
  isActive: Boolean,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Contractor = mongoose.model('Contractor', contractorSchema);

// Real contractor data from mock with credentials
const contractorCredentials = [
  {
    email: 'mohamadaadilj.23aid@kongu.edu',
    password: 'password1',
    company: 'Raj & Associates Construction',
    specialties: ['Residential', 'Interior Design', 'Renovation'],
    bio: 'Award-winning construction company specializing in premium residential builds and modern interior designs. Over 16 years of excellence in South Indian construction.',
    experience: 16,
    rating: 4.9,
    totalProjects: 98,
    completionRate: 95,
    hourlyRate: 850,
    certifications: [
      { name: 'Licensed Contractor', issuer: 'Government', date: new Date('2010-01-01') },
      { name: 'Vastu Expert', issuer: 'Vastu Board', date: new Date('2012-01-01') },
      { name: 'Green Building', issuer: 'LEED', date: new Date('2015-01-01') },
    ],
    isVerified: true,
    isActive: true,
    availability: 'available',
  },
  {
    email: 'meiajay@gmail.com',
    password: 'password2',
    company: 'Keralam Infra Solutions',
    specialties: ['Commercial', 'Infrastructure', 'Electrical'],
    bio: 'Leading commercial construction and infrastructure specialist. Delivering large-scale projects from planning to execution with cutting-edge technology.',
    experience: 13,
    rating: 4.7,
    totalProjects: 67,
    completionRate: 92,
    hourlyRate: 950,
    certifications: [
      { name: 'Licensed Engineer', issuer: 'Government', date: new Date('2011-01-01') },
      { name: 'ISO Certified', issuer: 'ISO', date: new Date('2018-01-01') },
      { name: 'Safety Certified', issuer: 'Safety Board', date: new Date('2019-01-01') },
    ],
    isVerified: true,
    isActive: true,
    availability: 'available',
  },
  {
    email: 'palani.pmp.ele@gmail.com',
    password: 'password3',
    company: 'Bangalore Premier Builders',
    specialties: ['Commercial', 'Residential', 'Mall Construction'],
    bio: 'Premier construction firm recognized for premium residential and commercial complexes. Specializing in innovative architectural designs and quality execution.',
    experience: 18,
    rating: 4.8,
    totalProjects: 156,
    completionRate: 96,
    hourlyRate: 1000,
    certifications: [
      { name: 'Licensed Contractor', issuer: 'Government', date: new Date('2006-01-01') },
      { name: 'Project Management', issuer: 'PMI', date: new Date('2014-01-01') },
      { name: 'BIS Certified', issuer: 'BIS', date: new Date('2016-01-01') },
    ],
    isVerified: true,
    isActive: true,
    availability: 'available',
  },
  {
    email: 'email4@gmail.com',
    password: 'password4',
    company: 'Coimbatore Express Builders',
    specialties: ['Plumbing', 'Electrical', 'Foundation Works'],
    bio: 'Specialized contractor with two decades of expertise in plumbing, electrical and foundation works. Trusted by residential and commercial clients across Tamil Nadu.',
    experience: 14,
    rating: 4.6,
    totalProjects: 187,
    completionRate: 91,
    hourlyRate: 750,
    certifications: [
      { name: 'Master Electrician', issuer: 'Electrical Board', date: new Date('2010-01-01') },
      { name: 'Plumbing License', issuer: 'Plumbing Board', date: new Date('2012-01-01') },
      { name: 'Safety Certificate', issuer: 'Safety Board', date: new Date('2018-01-01') },
    ],
    isVerified: true,
    isActive: true,
    availability: 'available',
  },
  {
    email: 'email5@gmail.com',
    password: 'password5',
    company: 'Thiruvananthapuram Modern Constructions',
    specialties: ['Architecture', 'Interior Design', 'Restoration'],
    bio: 'Modern construction with heritage restoration expertise. Combining traditional Kerala architecture with contemporary design for unique spaces.',
    experience: 11,
    rating: 4.8,
    totalProjects: 134,
    completionRate: 94,
    hourlyRate: 900,
    certifications: [
      { name: 'Architectural Expert', issuer: 'Architecture Board', date: new Date('2013-01-01') },
      { name: 'Heritage Restoration', issuer: 'Heritage Board', date: new Date('2015-01-01') },
      { name: 'Design Certified', issuer: 'Design Council', date: new Date('2017-01-01') },
    ],
    isVerified: true,
    isActive: true,
    availability: 'available',
  },
  {
    email: 'email6@gmail.com',
    password: 'password6',
    company: 'Mysore Quality Projects',
    specialties: ['Civil Works', 'Landscaping', 'Painting'],
    bio: 'Quality-focused construction company known for meticulous civil works and beautiful landscaping. Creating premium living spaces in Mysore and vicinity.',
    experience: 12,
    rating: 4.7,
    totalProjects: 156,
    completionRate: 93,
    hourlyRate: 800,
    certifications: [
      { name: 'Civil Engineer', issuer: 'Engineering Board', date: new Date('2012-01-01') },
      { name: 'Environmental Expert', issuer: 'Environment Board', date: new Date('2015-01-01') },
      { name: 'Landscape Certified', issuer: 'Landscape Council', date: new Date('2017-01-01') },
    ],
    isVerified: true,
    isActive: true,
    availability: 'available',
  },
];

async function seedRealContractors() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/nexa-infra';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Clear existing contractor data for fresh seed
    const emailsToDelete = contractorCredentials.map(c => c.email);
    const deletedUsers = await User.deleteMany({ email: { $in: emailsToDelete } });
    console.log(`🗑️  Cleared ${deletedUsers.deletedCount} old contractors`);

    const deletedContractors = await Contractor.deleteMany({});
    console.log(`🗑️  Cleared ${deletedContractors.deletedCount} old contractor profiles\n`);

    let createdCount = 0;

    for (const contractor of contractorCredentials) {
      // Create User - hash password manually before saving
      // Use insertMany to bypass pre-save hooks (prevents double hashing)
      const hashedPassword = await bcryptjs.hash(contractor.password, 10);
      
      const userDoc = {
        email: contractor.email,
        password: hashedPassword,
        name: contractor.company,
        role: 'contractor',
        isActive: true,
        isVerified: false,
      };

      const [newUser] = await User.insertMany([userDoc]);

      // Create Contractor Profile
      await Contractor.insertMany([{
        userId: newUser._id,
        company: contractor.company,
        specialties: contractor.specialties,
        bio: contractor.bio,
        experience: contractor.experience,
        rating: contractor.rating,
        totalProjects: contractor.totalProjects,
        completionRate: contractor.completionRate,
        hourlyRate: contractor.hourlyRate,
        certifications: contractor.certifications,
        isVerified: contractor.isVerified,
        isActive: contractor.isActive,
        availability: contractor.availability,
      }]);

      console.log(`✅ Created ${contractor.company}`);
      console.log(`   📧 Email: ${contractor.email}`);
      console.log(`   🔐 Password: ${contractor.password}`);
      createdCount++;
    }

    console.log('\n✨ Seeding completed!');
    console.log(`✅ Total Created: ${createdCount} contractors\n`);
    console.log('\nContractor Login Credentials:');
    console.log('=====================================');
    contractorCredentials.forEach((c, i) => {
      console.log(`${i + 1}. Email: ${c.email}`);
      console.log(`   Password: ${c.password}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedRealContractors();
