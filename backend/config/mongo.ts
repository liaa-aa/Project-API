import mongoose from 'mongoose'

const mongoUrl = process.env.MONGODB_URI as string

mongoose.connect(mongoUrl)

const connection = mongoose.connection

connection.on('connected', () => {
  console.log('✅ MongoDB Connected')
})

connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err)
})

export default mongoose
