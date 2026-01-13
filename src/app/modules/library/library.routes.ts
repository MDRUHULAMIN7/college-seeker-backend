import express from 'express';
import { addToLibrary, getMyLibrary, moveBook, updateProgress } from './library.controller.js';

const router = express.Router();

router.post('/', addToLibrary);
router.get('/:id', getMyLibrary);
router.put('/moveBook/:id', moveBook);
router.put('/progress/:id', updateProgress);

export const LibraryRoutes = router;
