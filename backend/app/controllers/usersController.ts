import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/users'



export default class usersController {
  // GET /users
  public async index({ response }: HttpContext) {
    const users = await User.find()
    return response.ok(users)
  }

  // GET /users/:id
  public async show({ params, response }: HttpContext) {
    const user = await User.findById(params.id)
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }
    return response.ok(user)
  }

  // POST /users
  public async store({ request, response }: HttpContext) {
    const data = request.only(['name', 'email', 'password'])
    const user = await User.create(data)
    return response.created(user)
  }

  // PUT /users/:id
  public async update({ params, request, response }: HttpContext) {
    const user = await User.findByIdAndUpdate(
      params.id,
      request.only(['name', 'email', 'password']),
      { new: true }
    )
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }
    return response.ok(user)
  }

  // DELETE /users/:id
  public async destroy({ params, response }: HttpContext) {
    const user = await User.findByIdAndDelete(params.id)
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }
    return response.ok({ message: 'User deleted successfully' })
  }
}