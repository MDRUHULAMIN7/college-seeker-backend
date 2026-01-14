import express from 'express';
import { getDashboardStats, getPersonalizedRecommendations } from './recommendation.controller.js';

const router = express.Router();
router.get('/:id', getPersonalizedRecommendations);
router.get('/', getDashboardStats);

export const RecommendationRoutes = router;