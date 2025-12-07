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
router.post('/google-login', '#controllers/authController.googleLogin')

//CRUD admin
router
  .group(() => {
    router.get('/users', '#controllers/usersController.index')
    router.post('/users', '#controllers/usersController.store')
    router.delete('/users/:id', '#controllers/usersController.destroy')
  })
  .use(middleware.auth())
  .use(middleware.admin())

router.put('/users/:id', '#controllers/usersController.update').use(middleware.auth())
router.get('/users/:id', '#controllers/usersController.show')

router
  .group(() => {
    router.post('/graphql', '#controllers/graphqlController.handle')
  })
  .use(middleware.auth())

router.get('/weather', '#controllers/weatherController.getByCity')
router.get('/weather/bencana/:id', '#controllers/weatherController.getByBencana')
