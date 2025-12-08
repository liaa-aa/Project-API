import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import jwt from 'jsonwebtoken'

interface JwtPayload {
  id: string
  email: string
  name: string
  role: 'admin' | 'relawan'
  iat?: number
  exp?: number
}

export default class OptionalAuthMiddleware {
  async handle({ request }: HttpContext, next: NextFn) {
    const authHeader = request.header('authorization')

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7)

      try {
        const decoded = jwt.verify(
          token,
          env.get('JWT_SECRET') || ''
        ) as JwtPayload

        ;(request as any).user = decoded
      } catch (error) {
        
      }
    }

    return await next()
  }
}
