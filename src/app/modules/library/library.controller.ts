import type{ Request, Response } from 'express';
import { Library } from './library.model.js';



export const addToLibrary = async (req: Request, res: Response) => {
  try {
    const {userId , bookId, shelf } = req.body;
    const exists = await Library.findOne({
      user: userId,
      book: bookId,
    });

    if (exists) {
      return res.status(400).json({
        success: false,
        message: 'Book already added to library',
      });
    }

    const libraryItem = await Library.create({
      user: userId,
      book: bookId, 
      shelf: shelf || 'want',
    });

    res.status(201).json({
      success: true,
      data: libraryItem,
    });
  } catch (error:any) {
    res.status(500).json({
      success: false,
      message:error.message || 'Failed to add book',
    });
  }
};

export const getMyLibrary = async (req: Request, res: Response) => {
  const userId = req.params.id;

  const library = await Library.find({ user: userId })
    .populate('book') 
    .sort({ updatedAt: -1 });

  res.json({ success: true, data: library });
};


export const moveBook = async (req: Request, res: Response) => {
  try {
    const userId   = req.params.id;
    const { shelf,bookId } = req.body;
         
    const updated = await Library.findOneAndUpdate(
      { user: userId, book: bookId },
      { shelf },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: 'Book not found in library',
      });
    }

    res.json({
      success: true,
      data: updated,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Failed to move book',
    });
  }
};


export const updateProgress = async (req: Request, res: Response) => {

  const userId = req.params.id;
  const { progress,bookId  } = req.body;

  const update: any = {
    progress,
    shelf: progress === 100 ? 'read' : 'reading',
  };

  if (progress > 0) update.startedAt = new Date();
  if (progress === 100) update.finishedAt = new Date();

  const item = await Library.findOneAndUpdate(
    { user: userId, book: bookId },
    update,
    { new: true }
  );

  res.json({ success: true, data: item });
};

