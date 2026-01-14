// controllers/book.controller.ts
import type { Request, Response } from 'express';
import { Book } from './book.model.js';
import { Genre } from '../genre/genre.model.js';
import mongoose from 'mongoose';

// CREATE BOOK
export const createBook = async (req: Request, res: Response) => {
  try {
    const { title, author, genre, description, summary, coverImage } = req.body;
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

// GET ALL BOOKS
export const getBooks = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const skip = (page - 1) * limit;

    const search = req.query.search as string;
    const genres = req.query.genres as string;
    const sortBy = req.query.sortBy as string;
    const ratingMin = parseFloat(req.query.ratingMin as string) || 0;
    const ratingMax = parseFloat(req.query.ratingMax as string) || 5;

    // Match stage for search & genre
    const match: any = {};

    if (search) {
      match.$or = [
        { title: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }

    if (genres) {
      const genreArray = genres.split(',').map(g => new mongoose.Types.ObjectId(g.trim()));
      match.genre = { $in: genreArray };
    }

    // Aggregation pipeline
    const pipeline: any[] = [
      { $match: match },
      // Lookup genre details
      {
        $lookup: {
          from: 'genres',
          localField: 'genre',
          foreignField: '_id',
          as: 'genreDetails',
        },
      },
      {
        $unwind: {
          path: '$genreDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Lookup reviews
      {
        $lookup: {
          from: 'reviews',
          localField: '_id',
          foreignField: 'bookId',
          as: 'reviews',
        },
      },
      // Calculate average rating (handle null/empty reviews)
      {
        $addFields: {
          avgRating: {
            $cond: {
              if: { $gt: [{ $size: '$reviews' }, 0] },
              then: { $avg: '$reviews.rating' },
              else: 0, // Default to 0 if no reviews
            },
          },
        },
      },
      // Lookup Library to count shelves
      {
        $lookup: {
          from: 'libraries',
          localField: '_id',
          foreignField: 'book',
          as: 'shelves',
        },
      },
      {
        $addFields: {
          shelvedCount: { $size: '$shelves' },
        },
      },
      // Filter by rating range (after calculating avgRating)
      {
        $match: {
          $expr: {
            $and: [
              { $gte: ['$avgRating', ratingMin] },
              { $lte: ['$avgRating', ratingMax] },
            ],
          },
        },
      },
      {
        $project: {
          title: 1,
          author: 1,
          genre: {
            _id: '$genreDetails._id',
            name: '$genreDetails.name',
          },
          coverImage: 1,
          avgRating: 1,
          shelvedCount: 1,
          createdAt: 1,
        },
      },
    ];

    // Sorting
    if (sortBy === 'rating') {
      pipeline.push({ $sort: { avgRating: -1, title: 1 } });
    } else if (sortBy === 'mostShelved') {
      pipeline.push({ $sort: { shelvedCount: -1, title: 1 } });
    } else if (sortBy === 'title') {
      pipeline.push({ $sort: { title: 1 } });
    } else {
      pipeline.push({ $sort: { createdAt: -1 } });
    }

    // Get total count before pagination
    const countPipeline = [...pipeline];
    countPipeline.push({ $count: 'total' });
    
    const totalResult = await Book.aggregate(countPipeline);
    const total = totalResult[0]?.total || 0;

    // Add pagination to main pipeline
    pipeline.push({ $skip: skip }, { $limit: limit });

    const books = await Book.aggregate(pipeline);

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


// GET SINGLE BOOK 
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