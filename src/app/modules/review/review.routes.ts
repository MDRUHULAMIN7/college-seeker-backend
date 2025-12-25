import express from 'express';
import { createReview, getAllReviews } from './review.controller.js';

const router = express.Router();
router.post('/', createReview);
router.get('/', getAllReviews);             
  

export const ReviewRoutes = router;
