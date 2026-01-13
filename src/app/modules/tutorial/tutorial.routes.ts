import express from 'express';
import { createTutorial, deleteTutorial, getAllTutorials, getTutorialById, updateTutorial } from './tutorial.controller.js';

const router = express.Router();
router.get('/', getAllTutorials);
router.get('/:id', getTutorialById);
router.post('/', createTutorial);
router.put('/:id', updateTutorial);
router.delete('/:id', deleteTutorial);

  

export const TutorialRoutes = router;
