import express from 'express';
const router = express.Router();

import { createUser, authenticateUser } from '../controllers/authCtl.js';

router.post('/signup', createUser);
router.post('/login', authenticateUser);

export { router as authRouter }