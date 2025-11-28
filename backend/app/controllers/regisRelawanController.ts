import type { HttpContext } from '@adonisjs/core/http'
import VolunteerRegistration from '#models/regis_relawan'
import Bencana from '#models/bencana'

export default class VolunteerRegistrationsController {
  public async join({ params, request, response }: HttpContext) {
    const authUser = (request as any).user

    if (!authUser) {
      return response.unauthorized({ message: 'Harus login untuk mendaftar' })
    }

    const bencana = await Bencana.findById(params.id)
    if (!bencana) {
      return response.notFound({ message: 'Bencana tidak ditemukan' })
    }

    try {
      const registration = await VolunteerRegistration.create({
        user: authUser.id,
        bencana: bencana._id,
        status: 'pending', 
      })

      return response.created({
        message: 'Berhasil mendaftar sebagai relawan',
        data: registration,
      })
    } catch (error: any) {
      // Tangani duplicate key (sudah pernah daftar)
      if (error.code === 11000) {
        return response.conflict({
          message: 'Kamu sudah terdaftar sebagai relawan pada bencana ini',
        })
      }

      console.error(error)
      return response.internalServerError({
        message: 'Terjadi kesalahan saat mendaftar',
      })
    }
  }


  public async myRegistrations({ request, response }: HttpContext) {
    const authUser = (request as any).user

    if (!authUser) {
      return response.unauthorized({ message: 'Harus login' })
    }

    const registrations = await VolunteerRegistration.find({
      user: authUser.id,
    })
      .populate('bencana') // supaya dapat data bencananya
      .sort({ createdAt: -1 })

    return response.ok(registrations)
  }

  public async eventVolunteers({ params, response }: HttpContext) {
    const registrations = await VolunteerRegistration.find({
      bencana: params.id,
    })
      .populate('user', 'name email role') // hanya kirim field aman
      .sort({ createdAt: 1 })

    return response.ok(registrations)
  }


  public async updateStatus({ params, request, response }: HttpContext) {
    const { status } = request.only(['status'])

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return response.badRequest({ message: 'Status tidak valid' })
    }

    const registration = await VolunteerRegistration.findByIdAndUpdate(
      params.id,
      { status },
      { new: true }
    )
      .populate('user', 'name email')
      .populate('bencana')

    if (!registration) {
      return response.notFound({ message: 'Pendaftaran tidak ditemukan' })
    }

    return response.ok({
      message: 'Status pendaftaran diperbarui',
      data: registration,
    })
  }
}
