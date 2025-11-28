import Bencana from '#models/bencana'
import RegisRelawan from '#models/regis_relawan'

export const root = {
  async getBencana() {
    return await Bencana.find()
  },

  async getBencanaById({ id }: { id: string }) {
    return await Bencana.findById(id)
  },

  async createBencana(
    {
      title,
      description,
      location,
      type,
      date,
    }: {
      title: string
      description: string
      location: string
      type: string
      date: string
    },
    context: any
  ) {
    if (context.user?.role !== 'admin') {
      throw new Error('Unauthorized')
    }
    const bencana = new Bencana({ title, description, location, type, date })
    return await bencana.save()
  },

  async updateBencana(
    {
      id,
      title,
      description,
      location,
      type,
      date,
    }: {
      id: string
      title?: string
      description?: string
      location?: string
      type?: string
      date?: string
    },
    context: any
  ) {
    if (context.user?.role !== 'admin') {
      throw new Error('Unauthorized')
    }
    return await Bencana.findByIdAndUpdate(
      id,
      { title, description, location, type, date },
      { new: true }
    )
  },
  async deleteBencana({ id }: { id: string }, context: any) {
    if (context.user?.role !== 'admin') {
      throw new Error('Unauthorized')
    }
    const deleted = await Bencana.findByIdAndDelete(id)

    if (!deleted) {
      throw new Error('Bencana not found')
    }
    return deleted
  },

  // ========= RELAWAN: JOIN BENCANA =========
  async joinBencana({ bencanaId }: { bencanaId: string }, context: any) {
    const user = context.user
    if (!user) {
      throw new Error('Unauthorized')
    }

    const bencana = await Bencana.findById(bencanaId)
    if (!bencana) {
      throw new Error('Bencana not found')
    }

    try {
      const registration = await RegisRelawan.create({
        user: user.id,
        bencana: bencanaId,
        status: 'pending',
      })

      return {
        id: registration._id.toString(),
        userId: registration.user.toString(),
        bencanaId: registration.bencana.toString(),
        status: registration.status,
        createdAt: registration.createdAt.toISOString(),
        updatedAt: registration.updatedAt.toISOString(),
      }
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('You have already registered event')
      }
      throw error
    }
  },

  async myRegistrations(_: any, context: any) {
    const user = context.user
    if (!user) {
      throw new Error('Unauthorized')
    }

    const registrations = await RegisRelawan.find({ user: user.id }).sort({
      createdAt: -1,
    })

    return registrations.map((registration) => ({
      id: registration._id.toString(),
      userId: registration.user.toString(),
      bencanaId: registration.bencana.toString(),
      status: registration.status,
      createdAt: registration.createdAt.toISOString(),
      updatedAt: registration.updatedAt.toISOString(),
    }))
  },

  async bencanaRelawan({ bencanaId }: { bencanaId: string }, context: any) {
    if (context.user?.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    const registrations = await RegisRelawan.find({
      bencana: bencanaId,
    }).sort({ createdAt: -1 })

    return registrations.map((registration) => ({
      id: registration._id.toString(),
      userId: registration.user.toString(),

      bencanaId: registration.bencana.toString(),
      status: registration.status,
      createdAt: registration.createdAt.toISOString(),
      updatedAt: registration.updatedAt.toISOString(),
    }))
  },

  async updateRegistrationStatus({ id, status }: { id: string; status: string }, context: any) {
    if (context.user?.role !== 'admin') {
      throw new Error('Unauthorized')
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      throw new Error('Invalid status value')
    }

    const registration = await RegisRelawan.findByIdAndUpdate(id, { status }, { new: true })

    if (!registration) {
      throw new Error('Registration not found')
    }

    return {
      id: registration._id.toString(),
      userId: registration.user.toString(),
      bencanaId: registration.bencana.toString(),
      createdAt: registration.createdAt.toISOString(),
      updatedAt: registration.updatedAt.toISOString(),
    }
  },
}
