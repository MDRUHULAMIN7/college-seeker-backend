// controllers/genre.controller.ts
import type { Request, Response } from 'express';
import { Genre } from './genre.model.js'; // adjust path

// CREATE GENRE
export const createGenre = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    if (!name || !description) {
      return res.status(400).json({
        success: false,
        message: 'Name and description are required',
      });
    }

    const existingGenre = await Genre.findOne({ name });
    if (existingGenre) {
      return res.status(400).json({
        success: false,
        message: 'Genre already exists',
      });
    }

    const genre = await Genre.create({ name, description });

    res.status(201).json({
      success: true,
      message: 'Genre created successfully',
      data: genre,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create genre',
    });
  }
};

// GET ALL GENRES WITH PAGINATION
export const getGenres = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await Genre.countDocuments();
    const genres = await Genre.find().skip(skip).limit(limit);

    res.status(200).json({
      success: true,
      data: genres,
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
      message: error.message || 'Failed to fetch genres',
    });
  }
};

// GET SINGLE GENRE
export const getGenre = async (req: Request, res: Response) => {
  try {
    const genre = await Genre.findById(req.params.id);
    if (!genre) {
      return res.status(404).json({
        success: false,
        message: 'Genre not found',
      });
    }

    res.status(200).json({
      success: true,
      data: genre,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch genre',
    });
  }
};

// UPDATE GENRE
export const updateGenre = async (req: Request, res: Response) => {
  try {
    const { name, description } = req.body;

    const genre = await Genre.findById(req.params.id);
    if (!genre) {
      return res.status(404).json({
        success: false,
        message: 'Genre not found',
      });
    }

    genre.name = name || genre.name;
    genre.description = description || genre.description;

    const updatedGenre = await genre.save();

    res.status(200).json({
      success: true,
      message: 'Genre updated successfully',
      data: updatedGenre,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update genre',
    });
  }
};

// DELETE GENRE
export const deleteGenre = async (req: Request, res: Response) => {
  try {
    const genre = await Genre.findById(req.params.id);
    if (!genre) {
      return res.status(404).json({
        success: false,
        message: 'Genre not found',
      });
    }

    await genre.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Genre deleted successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete genre',
    });
  }
};

// GET ALL GENRE NAMES
export const getGenreNames = async (req: Request, res: Response) => {
  try {
    const genres = await Genre.find().select('_id name').sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: genres,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch genre names',
    });
  }
};