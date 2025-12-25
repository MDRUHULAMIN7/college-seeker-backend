
import Review from "./review.model.js"; 
import type { Request, Response } from "express";

// Create a new review
export const createReview = async (req: Request, res: Response) => {
  try {
    const { collegeId, userId, rating, comment } = req.body;
    const alreadyReviewed = await Review.findOne({ college: collegeId, user: userId });
    if (alreadyReviewed) {
      return res.status(400).json({
        success: false,
        message: "You have already added a review for this college",
      });
    }

    const review = await Review.create({
      college: collegeId,
      user: userId,
      rating,
      comment,
    });

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      data: review,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: "Failed to submit review",
      error: error.message,
    });
  }
};



export const getAllReviews = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;      
    const limit = parseInt(req.query.limit as string) || 20;   
    const skip = (page - 1) * limit;

    const total = await Review.countDocuments();

    const reviews = await Review.find()
      .populate("college", "name image")
      .populate("user", "name") 
      .sort({ createdAt: -1 })           
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: reviews,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch reviews",
    });
  }
};

