import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/users'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import env from '#start/env'

export default class AuthController {
  // POST /register
  public async register({ request, response }: HttpContext) {
    try {
      const { name, email, password } = request.only(['name', 'email', 'password'])

      // Check if user already exists
      const existingUser = await User.findOne({ email })
      if (existingUser) {
        return response.badRequest({ message: 'Email sudah terdaftar' })
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10)

      // Create user
      const user = await User.create({
        name,
        email,
        password: hashedPassword,
      })

      return response.created({
        message: 'User berhasil dibuat',
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      })
    } catch (error) {
      return response.internalServerError({ message: 'Terjadi kesalahan server' })
    }
  }

  // POST /login
  public async login({ request, response }: HttpContext) {
    try {
      const { email, password } = request.only(['email', 'password'])

      // Find user by email
      const user = await User.findOne({ email })
      if (!user) {
        return response.unauthorized({ message: 'Email atau password salah' })
      }

      // Check password
      const isValidPassword = await bcrypt.compare(password, user.password)
      if (!isValidPassword) {
        return response.unauthorized({ message: 'Email atau password salah' })
      }

      // Generate JWT token
      const token = jwt.sign(
        {
          id: user._id,
          email: user.email,
          name: user.name,
        },
        env.get('JWT_SECRET') || '',
        { expiresIn: '24h' }
      )

      return response.ok({
        message: 'Login berhasil',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      })
    } catch (error) {
      return response.internalServerError({ message: 'Terjadi kesalahan server' })
    }
  }
}