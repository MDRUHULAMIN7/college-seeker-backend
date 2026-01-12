
import express from 'express';
import {
  createGenre,
  getGenres,
  getGenre,
  updateGenre,
  deleteGenre,
  getGenreNames,
} from './genre.controller.js';

const router = express.Router();

router.post('/', createGenre);

router.get('/', getGenres);

router.get('/genre-names', getGenreNames);

router.get('/:id', getGenre);

router.put('/:id', updateGenre);

router.delete('/:id', deleteGenre);

export const GenreRoutes = router;
