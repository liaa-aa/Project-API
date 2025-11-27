import Bencana from '#models/bencana'

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
    }, context: any
  ) {
    if (context.user?.role !== 'admin') {
        throw new Error('Unauthorized');
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
      title: string
      description: string
      location: string
      type: string
      date: string
    }, context: any
  ) {
    if (context.user?.role !== 'admin') {
        throw new Error('Unauthorized');
    }
    return await Bencana.findByIdAndUpdate(
      id,
      { title, description, location, type, date },
      { new: true }
    )
  },
  async deleteBencana({ id }: { id: string }, context: any) {
    if (context.user?.role !== 'admin') {
        throw new Error('Unauthorized');
    }
    return await Bencana.findByIdAndDelete(id)
  },
}
