import { BaseCommand } from '@adonisjs/core/ace'
import bcrypt from 'bcryptjs'
import User from '#models/users'

export default class SeedAdmin extends BaseCommand {
  public static commandName = 'seed:admin'
  public static description = 'Create an admin user'
  public async run() {
    const name = 'Admin'
    const email = 'admin@example.com'
    const password = 'adminpassword'

    const existingAdmin = await User.findOne({ email, role: 'admin' })
    if (existingAdmin) {
      this.logger.info('Admin user already exists.')
      return
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
    })

    this.logger.info(`Admin berhasil dibuat.\nEmail: ${email}\nPassword: ${password}`)
  }
}
