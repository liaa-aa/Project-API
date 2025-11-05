/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'

router.get('/users', '#controllers/usersController.index')
router.get('/users/:id', '#controllers/usersController.show')
router.post('/users', '#controllers/usersController.store')
router.put('/users/:id', '#controllers/usersController.update')
router.delete('/users/:id', '#controllers/usersController.destroy')
