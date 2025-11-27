import type { HttpContext } from '@adonisjs/core/http'
import Bencana from '#models/bencana'

export default class BencanaController {
  // GET /bencana
  public async index({ response }: HttpContext) {
    const bencanas = await Bencana.find()
    return response.ok(bencanas)
  }
  // GET /bencana/:id
  public async show({ params, response }: HttpContext) {
    const bencana = await Bencana.findById(params.id)
    if (!bencana) {
      return response.notFound({ message: 'Bencana not found' })
    }
    return response.ok(bencana)
  }
  // POST /bencana
  public async store({ request, response }: HttpContext) {
    const data = request.only(['title', 'description', 'location', 'type', 'date'])
    const bencana = await Bencana.create(data)
    return response.created(bencana)
  }
  // PUT /bencana/:id
  public async update({ params, request, response }: HttpContext) {
    const bencana = await Bencana.findByIdAndUpdate(
      params.id,
      request.only(['title', 'description', 'location', 'type', 'date']),
      { new: true }
    )
    if (!bencana) {
      return response.notFound({ message: 'Bencana not found' })
    }
    return response.ok(bencana)
  }
  // DELETE /bencana/:id
  public async destroy({ params, response }: HttpContext) {
    const bencana = await Bencana.findByIdAndDelete(params.id)
    if (!bencana) {
      return response.notFound({ message: 'Bencana not found' })
    }
    return response.ok({ message: 'Bencana deleted successfully' })
  }
}
