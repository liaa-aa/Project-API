import mongoose from 'mongoose'
import env from '#start/env'

const mongoUrl = env.get('MONGODB_URI')

if (!mongoUrl) {
  throw new Error('MONGO_URI is not defined in environment variables')
}

mongoose.connect(mongoUrl)

const connection = mongoose.connection

connection.on('connected', () => {
  console.log('✅ MongoDB Connected')
})

connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err)
})

export default mongoose
