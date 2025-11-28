/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import { middleware } from '#start/kernel'

// Login routes (public)
router.post('/register', '#controllers/authController.register')
router.post('/login', '#controllers/authController.login')

// Bencana routes (public)
router.get('/bencana', '#controllers/bencanaController.index')
router.get('/bencana/:id', '#controllers/bencanaController.show')

// Bencana routes (protected)
// router
//   .group(() => {
//     router.get('/users', '#controllers/usersController.index')
//     router.post('/bencana', '#controllers/bencanaController.store')
//     router.delete('/bencana/:id', '#controllers/bencanaController.destroy')
//   })
//   .use(middleware.auth())
//   .use(middleware.admin())

// Protected routes (need authentication)
router
  .group(() => {
    router.get('/users', '#controllers/usersController.index')
    router.post('/users', '#controllers/usersController.store')
    router.put('/users/:id', '#controllers/usersController.update')
    router.delete('/users/:id', '#controllers/usersController.destroy')
  })
  .use(middleware.auth())
  .use(middleware.admin())

// Public user routes
router.get('/users/:id', '#controllers/usersController.show')
router.put('/bencana/:id', '#controllers/bencanaController.update')

// GraphQL route (protected)
router
  .group(() => {
    router.post('/graphql', '#controllers/graphqlController.handle')
  })
  .use(middleware.auth())

// registrasi relawan (harus login dulu)
router
  .group(() => {
    router.post('/bencana/:id/join', '#controllers/regisRelawanController.join')
    router.get('/me/registrations', '#controllers/regisRelawanController.myRegistrations')
  })
  .use(middleware.auth())

// admin melihat semua pendaftar relawan dan mengubah status pendaftaran
router
  .group(() => {
    router.get('/bencana/:id/relawan', '#controllers/regisRelawanController.bencanaVolunteers')
    router.put(
      '/registrations/:id/status',
      '#controllers/regisRelawanController.updateRegistrationStatus'
    )
  })
  .use(middleware.auth())
  .use(middleware.admin())
