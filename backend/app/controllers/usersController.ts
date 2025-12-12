import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/users'
import Bencana from '#models/bencana'
import RegisRelawan from '#models/regis_relawan'


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
  // POST /users/:id/certificates
  public async addCertificate({ request, params, response }: HttpContext) {
    try {
      const loggedInUser = (request as any).user
      const targetUserId = params.id

      if (!loggedInUser) {
        return response.unauthorized({ message: 'Tidak terautentikasi' })
      }

      // Hanya user sendiri atau admin yg boleh nambah sertifikat
      if (loggedInUser.id !== targetUserId && loggedInUser.role !== 'admin') {
        return response.forbidden({ message: 'Tidak diizinkan menambah sertifikat user lain' })
      }

    const payload = request.only([
      'name',
      'provider',
      'dateIssued',
      'dateExpired',
      'certificateNumber',
      'category',
      'photo',
    ])

    if (!payload.name) {
      return response.badRequest({ message: 'Nama sertifikat (name) wajib diisi' })
    }

    const user = await User.findById(targetUserId)
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }

    // Convert date strings to Date objects
    if (payload.dateIssued) {
      payload.dateIssued = new Date(payload.dateIssued)
    }
    if (payload.dateExpired) {
      payload.dateExpired = new Date(payload.dateExpired)
    }

    user.certificates.push(payload)
    await user.save()

    return response.ok(user)
    } catch (error) {
      console.error('Add certificate error:', error)
      return response.internalServerError({ message: 'Terjadi kesalahan server' })
    }
  }
  public async updateCertificate({ request, params, response }: HttpContext) {
    const loggedInUser = (request as any).user
    const targetUserId = params.id
    const certId = params.certId

    if (!loggedInUser) {
      return response.unauthorized({ message: 'Tidak terautentikasi' })
    }

    if (loggedInUser.id !== targetUserId && loggedInUser.role !== 'admin') {
      return response.forbidden({ message: 'Tidak diizinkan mengubah sertifikat user lain' })
    }

    const user = await User.findById(targetUserId)
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }

    const cert = user.certificates.id(certId)
    if (!cert) {
      return response.notFound({ message: 'Sertifikat tidak ditemukan' })
    }

    const payload = request.only([
      'name',
      'provider',
      'dateIssued',
      'dateExpired',
      'certificateNumber',
      'category',
      'photo',
    ])

    Object.assign(cert, payload)

    await user.save()
    return response.ok(user)
  }
  public async deleteCertificate({ request, params, response }: HttpContext) {
    const loggedInUser = (request as any).user
    const targetUserId = params.id
    const certId = params.certId

    if (!loggedInUser) {
      return response.unauthorized({ message: 'Tidak terautentikasi' })
    }

    if (loggedInUser.id !== targetUserId && loggedInUser.role !== 'admin') {
      return response.forbidden({ message: 'Tidak diizinkan menghapus sertifikat user lain' })
    }

    const user = await User.findById(targetUserId)
    if (!user) {
      return response.notFound({ message: 'User not found' })
    }

    const cert = user.certificates.id(certId)
    if (!cert) {
      return response.notFound({ message: 'Sertifikat tidak ditemukan' })
    }
    user.certificates.pull({ _id: certId })

    await user.save()

    return response.ok(user)
  }
  public async getAdminStats({ response }: HttpContext) {
    const totalUsers = await User.countDocuments()
    const totalEvents = await Bencana.countDocuments()
    const totalVolunteers = await RegisRelawan.countDocuments({ status: 'approved' })

    return response.ok({
      totalUsers,
      totalEvents,
      totalVolunteers,
    })
  }
}
