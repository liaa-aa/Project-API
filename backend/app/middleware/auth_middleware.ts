import env from '#start/env'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import jwt from 'jsonwebtoken'

export default class AuthMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    const header = request.header('authorization')
    if (!header) {
      return response.unauthorized({ message: 'Akses tidak sah' })
    }

    const token = header.split(' ')[1]

    try {
      const docededToken = jwt.verify(token, env.get('JWT_SECRET') || '')

      // @ts-ignore
      request['user'] = docededToken
      const output = await next()
      return output
    } catch (error) {
      return response.unauthorized({ message: 'Akses tidak sah' })
    }
  }
} /*  */
