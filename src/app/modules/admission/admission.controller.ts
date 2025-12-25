import { Admission } from "./admission.model.js";
import type { Request, Response } from 'express';
export const createAdmission = async (req:Request, res:Response) => {
  try {
    const { email, college } = req.body;
    const alreadyApplied = await Admission.findOne({
      email,
      college,
    });

    if (alreadyApplied) {
      return res.status(400).json({
        success: false,
        message:
          "You have already submitted an admission for this college",
      });
    }
    const admission = await Admission.create(req.body);

    res.status(201).json({
      success: true,
      message: "Admission submitted successfully",
      data: admission,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Admission failed",error,
    });
  }
};
