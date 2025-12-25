
import express from 'express';
import { createAdmission } from './admission.controller.js';
const router = express.Router();

router.post('/', createAdmission);

export const AdmissionRoutes = router;