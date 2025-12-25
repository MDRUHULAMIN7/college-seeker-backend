import express from 'express';
import { createCollege, getCollegeDetails, getGraduates, getColleges, getRecommendedResearchPapers, getCollegesForAdmission, getMyCollege } from './college.controller.js';

const router = express.Router();
router.post('/', createCollege);
router.get('/', getColleges);             
router.get('/my-colleges', getMyCollege);             
router.get('/graduates', getGraduates);
router.get('/research-papers/recommended', getRecommendedResearchPapers);
router.get('/college-for-admission', getCollegesForAdmission);


router.get('/:id', getCollegeDetails);   

export const CollegeRoutes = router;
