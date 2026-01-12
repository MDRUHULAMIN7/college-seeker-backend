// controllers/book.controller.ts
import type { Request, Response } from 'express';
import { Book } from './book.model.js';
import { Genre } from '../genre/genre.model.js';

// CREATE BOOK
export const createBook = async (req: Request, res: Response) => {
  try {
    const { title, author, genre, description, summary, coverImage } = req.body;

    // Validate required fields
    if (!title || !author || !genre || !description || !summary || !coverImage) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required',
      });
    }

    // Check if genre exists
    const genreExists = await Genre.findById(genre);
    if (!genreExists) {
      return res.status(400).json({
        success: false,
        message: 'Invalid genre ID',
      });
    }

    // Check if book with same title already exists
    const existingBook = await Book.findOne({ title });
    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: 'Book with this title already exists',
      });
    }

    const book = await Book.create({
      title,
      author,
      genre,
      description,
      summary,
      coverImage,
    });

    // Populate genre details
    const populatedBook = await Book.findById(book._id).populate('genre', 'name');

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: populatedBook,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create book',
    });
  }
};

// GET ALL BOOKS WITH PAGINATION, SEARCH, AND FILTERS
export const getBooks = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    // Search query
    const search = req.query.search as string;
    
    // Filter by genres (multi-select)
    const genres = req.query.genres as string; // Comma-separated genre IDs
    
    // Sort options
    const sortBy = req.query.sortBy as string; // 'rating', 'mostShelved', 'title'

    // Build query object
    const query: any = {};

    // Search by title or author
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }

    // Filter by genres (multi-select)
    if (genres) {
      const genreArray = genres.split(',').map(g => g.trim());
      query.genre = { $in: genreArray };
    }

    // Build sort object
    let sort: any = {};
    switch (sortBy) {
      case 'title':
        sort = { title: 1 };
        break;
      case 'rating':
        // This will need aggregation with reviews, simplified for now
        sort = { createdAt: -1 };
        break;
      case 'mostShelved':
        // This will need aggregation with user shelves, simplified for now
        sort = { createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Get total count
    const total = await Book.countDocuments(query);

    // Get books with limited fields (Title, Author, Genre, Cover Image)
    const books = await Book.find(query)
      .select('title author genre coverImage')
      .populate('genre', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: books,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch books',
    });
  }
};

// GET SINGLE BOOK (FULL DATA)
export const getBook = async (req: Request, res: Response) => {
  try {
    const book = await Book.findById(req.params.id).populate('genre', 'name description');
    
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch book',
    });
  }
};

// UPDATE BOOK
export const updateBook = async (req: Request, res: Response) => {
  try {
    const { title, author, genre, description, summary, coverImage } = req.body;

    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    // If genre is being updated, verify it exists
    if (genre && genre !== book.genre.toString()) {
      const genreExists = await Genre.findById(genre);
      if (!genreExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid genre ID',
        });
      }
    }

    // If title is being updated, check for duplicates
    if (title && title !== book.title) {
      const existingBook = await Book.findOne({ title });
      if (existingBook) {
        return res.status(400).json({
          success: false,
          message: 'Book with this title already exists',
        });
      }
    }

    // Update fields
    book.title = title || book.title;
    book.author = author || book.author;
    book.genre = genre || book.genre;
    book.description = description || book.description;
    book.summary = summary || book.summary;
    book.coverImage = coverImage || book.coverImage;

    const updatedBook = await book.save();
    const populatedBook = await Book.findById(updatedBook._id).populate('genre', 'name');

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: populatedBook,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update book',
    });
  }
};

// DELETE BOOK
export const deleteBook = async (req: Request, res: Response) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found',
      });
    }

    await book.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete book',
    });
  }
};