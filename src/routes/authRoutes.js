import express from 'express';
import AuthController from '../controllers/authController.js';

const router = express.Router();

router.post('/v1/signup', AuthController.signup);
router.post('/v1/login', AuthController.login);
// change password

export default router;
