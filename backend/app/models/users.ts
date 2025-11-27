import mongoose from '#config/mongo'

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['admin', 'relawan'],
      default: 'relawan',
    },
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model('User', UserSchema)
export default User //pakai 'export default' untuk model tunggal, dan 'export' untuk banyak ekspor.
