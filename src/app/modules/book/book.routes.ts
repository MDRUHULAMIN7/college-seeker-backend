// routes/book.routes.ts
import express from 'express';
import {
  createBook,
  getBooks,
  getBook,
  updateBook,
  deleteBook,
} from './book.controller.js';

const router = express.Router();

router.get('/', getBooks); // GET /api/books?page=1&limit=12&search=harry&genres=id1,id2&sortBy=rating
router.get('/:id', getBook); // GET /api/books/:id

router.post('/', createBook); // POST /api/books
router.put('/:id', updateBook); // PUT /api/books/:id
router.delete('/:id', deleteBook); // DELETE /api/books/:id

export const BookRoutes = router;
