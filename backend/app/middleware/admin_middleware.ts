import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

export default class AdminMiddleware {
  async handle({ request, response }: HttpContext, next: NextFn) {
    const user = (request as any).user

    if (!user) {
      return response.unauthorized({ message: 'Akses tidak sah' })
    }
    if (user.role !== 'admin') {
        return response.unauthorized({ message: 'Hanya admin yang bisa akses' })
    }
    return await next()
  } 
}