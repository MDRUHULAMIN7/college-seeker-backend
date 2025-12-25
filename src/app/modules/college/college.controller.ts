import type { Request, Response } from 'express';
import { College } from './college.model.js';
import { Admission } from '../admission/admission.model.js';

export const createCollege = async (req: Request, res: Response) => {
  try {
    const college = await College.create(req.body);

    res.status(201).json({
      success: true,
      message: 'College created successfully',
      data: college,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'College creation failed',
    });
  }
};


export const getColleges = async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '6', search = '' } = req.query;

    const currentPage = Number(page);
    const pageLimit = Number(limit);
    const skip = (currentPage - 1) * pageLimit;

    const query = {
      name: { $regex: search as string, $options: 'i' },
    };

    const colleges = await College.find(query)
      .select(
        'name image shortDescription admissionDate events researchHistory sports rating researchCount',
      )
      .skip(skip)
      .limit(pageLimit)
      .sort({ createdAt: -1 });

    const total = await College.countDocuments(query);

    res.status(200).json({
      success: true,
      meta: {
        total,
        page: currentPage,
        limit: pageLimit,
        totalPages: Math.ceil(total / pageLimit),
      },
      data: colleges,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch colleges',
    });
  }
};

export const getMyCollege = async (req: Request, res: Response) => {
  try {
    const { email } = req.query;

    const admission = await Admission.find({ email })
      .populate("college", "name image admissionDate")
      .sort({ createdAt: -1 });

    if (!admission) {
      return res.status(404).json({
        success: false,
        message: "No admission found",
      });
    }

    res.status(200).json({
      success: true,
      data: admission,
    });
  } catch (error:any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch admission",
    });
  }
};


export const getCollegeDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const college = await College.findById(id);
    if (!college) {
      return res.status(404).json({
        success: false,
        message: 'College not found',
      });
    }

    res.status(200).json({
      success: true,
      data: college,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch college details',
    });
  }
};

// Get all colleges graduates photos
export const getGraduates = async (req: Request, res: Response) => {
  try {
    // Only select college name and graduates array
    const colleges = await College.find({}, { name: 1, graduates: 1, _id: 0 });
    res.status(200).json({ success: true, data: colleges });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || "Failed to fetch graduates" });
  }
};
export const getRecommendedResearchPapers = async (
  req: Request,
  res: Response
) => {
  try {
    const papers = await College.aggregate([
      { $unwind: "$researchPapers" },
      {
        $project: {
          _id: 0,
          collegeName: "$name",
          paperTitle: "$researchPapers.title",
          paperLink: "$researchPapers.link",
          createdAt: 1
        }
      },
      { $sort: { createdAt: -1 } },
      { $limit: 3 }
    ]);

    res.status(200).json({
      success: true,
      data: papers
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch research papers"
    });
  }
};
// Get colleges for Admission page (only needed fields)
export const getCollegesForAdmission = async (req: Request, res: Response) => {
  try {
    const { page = "1", limit = "10" } = req.query;
    const currentPage = Number(page);
    const pageLimit = Number(limit);
    const skip = (currentPage - 1) * pageLimit;

    const colleges = await College.find({})
      .select("name image admissionDate rating") // only needed fields
      .skip(skip)
      .limit(pageLimit)
      .sort({ createdAt: -1 });

    const total = await College.countDocuments();

    res.status(200).json({
      success: true,
      meta: {
        total,
        page: currentPage,
        limit: pageLimit,
        totalPages: Math.ceil(total / pageLimit),
      },
      data: colleges,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch colleges",
    });
  }
};


