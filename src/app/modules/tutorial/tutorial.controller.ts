
import type{ Request, Response } from 'express';
import { User } from '../user/user.model.js';
import Tutorial from './tutorial.model.js';

//create tutorial
export const createTutorial = async (req: Request, res: Response) => {
  try {
    const { title, description, videoUrl, userId } = req.body;

    // Validate required fields
    if (!title || !videoUrl || !userId) {
      return res.status(400).json({ success: false, message: 'Title, video URL, and userId are required.' });
    }

    // Fetch user by ID and check role
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can create tutorials.' });
    }

    // Create tutorial
    const tutorial = await Tutorial.create({
      title,
      description,
      videoUrl,
      createdBy: user._id,
    });

    res.status(201).json({
      success: true,
      data: tutorial,
      message: 'Tutorial created successfully',
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error while creating tutorial',
    });
  }
};
//GET ALL TUTORIALS (WITH PAGINATION)
export const getAllTutorials = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const total = await Tutorial.countDocuments();
    const tutorials = await Tutorial.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: tutorials,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error.' });
  }
}
//  GET SINGLE TUTORIAL BY ID
export const getTutorialById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const tutorial = await Tutorial.findById(id);
    if (!tutorial) return res.status(404).json({ success: false, message: 'Tutorial not found.' });

    res.status(200).json({ success: true, data: tutorial });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error.' });
  }
};

// UPDATE TUTORIAL
export const updateTutorial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, videoUrl, userId } = req.body;

    if (!userId) return res.status(400).json({ success: false, message: 'userId is required for authorization.' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Only admins can update tutorials.' });

    const tutorial = await Tutorial.findById(id);
    if (!tutorial) return res.status(404).json({ success: false, message: 'Tutorial not found.' });

    tutorial.title = title ?? tutorial.title;
    tutorial.description = description ?? tutorial.description;
    tutorial.videoUrl = videoUrl ?? tutorial.videoUrl;

    await tutorial.save();

    res.status(200).json({ success: true, data: tutorial, message: 'Tutorial updated successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error.' });
  }
};

// DELETE TUTORIAL
export const deleteTutorial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    if (!userId) return res.status(400).json({ success: false, message: 'userId is required for authorization.' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    if (user.role !== 'admin') return res.status(403).json({ success: false, message: 'Only admins can delete tutorials.' });

    const tutorial = await Tutorial.findByIdAndDelete(id);
    if (!tutorial) return res.status(404).json({ success: false, message: 'Tutorial not found.' });

    res.status(200).json({ success: true, message: 'Tutorial deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Server error.' });
  }
};