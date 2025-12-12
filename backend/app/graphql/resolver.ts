import Bencana from '#models/bencana'
import RegisRelawan from '#models/regis_relawan'

export const root = {
  async getBencana() {
    const bencanas = await Bencana.find()

    const results = []

    for (const bencana of bencanas) {
      const currentVolunteers = await RegisRelawan.countDocuments({
        bencana: bencana._id,
        status: 'approved',
      })

      results.push({
        id: bencana._id.toString(),
        title: bencana.title,
        description: bencana.description,
        location: bencana.location,
        type: bencana.type,
        date: bencana.date.toISOString(),
        maxVolunteers: bencana.maxVolunteers,currentVolunteers,
        photo: bencana.photo,
      })
    }
    return results
  },

  async getBencanaById({ id }: { id: string }) {
    const bencana = await Bencana.findById(id)
    if (!bencana) {
      return null
    }

    const currentVolunteers = await RegisRelawan.countDocuments({
      bencana: bencana._id,
      status: 'approved',
    })

    return {
      id: bencana._id.toString(),
      title: bencana.title,
      description: bencana.description,
      location: bencana.location,
      type: bencana.type,
      date: bencana.date.toISOString(),
      maxVolunteers: bencana.maxVolunteers,currentVolunteers,
      photo: bencana.photo,
    }
  },

  async createBencana(
    {
      title,
      description,
      location,
      type,
      date,
      maxVolunteers,
      photo,
    }: {
      title: string
      description: string
      location: string
      type: string
      date: string
      maxVolunteers?: number
      photo?: string
    },
    context: any
  ) {
    if (context.user?.role !== 'admin') {
      throw new Error('Unauthorized')
    }
    const bencana = new Bencana({ title, description, location, type, date, maxVolunteers, photo })
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
      maxVolunteers,
      photo,
    }: {
      id: string
      title?: string
      description?: string
      location?: string
      type?: string
      date?: string
      maxVolunteers?: number
      photo?: string
    },
    context: any
  ) {
    if (context.user?.role !== 'admin') {
      throw new Error('Unauthorized')
    }
    const updates: any = {}
    if (title !== undefined) updates.title = title
    if (description !== undefined) updates.description = description
    if (location !== undefined) updates.location = location
    if (type !== undefined) updates.type = type
    if (date !== undefined) updates.date = date
    if (maxVolunteers !== undefined) updates.maxVolunteers = maxVolunteers 
    if (photo !== undefined) updates.photo = photo

    const bencana = await Bencana.findByIdAndUpdate(id, updates, { new: true })
    if (!bencana) {
      throw new Error('Bencana not found')
    }

    return bencana
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

    if (bencana.maxVolunteers && bencana.maxVolunteers > 0) {
      const currentCount = await RegisRelawan.countDocuments({
        bencana: bencanaId,
        status: 'approved',
      })

      if (currentCount >= bencana.maxVolunteers) {
        throw new Error('limit of volunteers reached for this event')
      }
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

  async cancelJoinBencana({ bencanaId }: { bencanaId: string }, context: any) {
    const user = context.user
    if (!user) {
      throw new Error('Unauthorized')
    }
    const registration = await RegisRelawan.findOneAndDelete({
      user: user.id,
      bencana: bencanaId,
    })
    if (!registration) {
      throw new Error('Registration not found')
    }

    return {
      id: registration._id.toString(),
      userId: registration.user.toString(),
      bencanaId: registration.bencana.toString(),
      status: registration.status,
      createdAt: registration.createdAt.toISOString(),
      updatedAt: registration.updatedAt.toISOString(),
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
