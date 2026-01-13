import express from 'express';
import {
  registerUser,
  signInUser,
  logoutUser,
  getAllUsers,
  updateUserRole,

} from './user.controller.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', signInUser);
router.post('/logout', logoutUser);
router.get('/allusers',getAllUsers)
router.put('/:id',updateUserRole)
export const UserRoutes = router;
