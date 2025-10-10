// // Test MongoDB connection
// require('dotenv').config({ path: '.env.local' })
// const mongoose = require('mongoose')

// const MONGODB_URI = process.env.MONGODB_URI

// console.log('Testing MongoDB connection...')
// console.log('MONGODB_URI exists:', !!MONGODB_URI)
// console.log('MONGODB_URI (masked):', MONGODB_URI ? MONGODB_URI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@') : 'NOT SET')

// if (!MONGODB_URI) {
//   console.error('❌ MONGODB_URI is not set in environment variables')
//   console.log('\nPlease create a .env.local file with:')
//   console.log('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database')
//   process.exit(1)
// }

// const opts = {
//   serverSelectionTimeoutMS: 10000,
//   socketTimeoutMS: 45000,
//   connectTimeoutMS: 10000,
// }

// mongoose.connect(MONGODB_URI, opts)
//   .then(() => {
//     console.log('✅ MongoDB connection successful!')
//     process.exit(0)
//   })
//   .catch((error) => {
//     console.error('❌ MongoDB connection failed:', error.message)
//     console.log('\nCommon issues:')
//     console.log('1. Check if MONGODB_URI is correct in .env.local')
//     console.log('2. Verify MongoDB server is running (if local)')
//     console.log('3. Check IP whitelist in MongoDB Atlas (if cloud)')
//     console.log('4. Verify network connectivity')
//     process.exit(1)
//   })
 