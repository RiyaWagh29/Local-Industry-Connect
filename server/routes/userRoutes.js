import express from "express";
import {
  getUserProfile,
  updateUserProfile,
  getAllMentors,
  getMatchedMentors,
  rateMentor,
  getLeaderboard,
  toggleFollowMentor,
} from "../controllers/userController.js";

import { protect } from "../middleware/authMiddleware.js";
import upload from "../middleware/uploadMiddleware.js";

const router = express.Router();

// Profile
router.route("/profile")
  .get(protect, getUserProfile)
  .put(protect, upload.single("avatar"), updateUserProfile);

// 🔥 FIX: PROTECT mentors route
router.route("/mentors").get(protect, getAllMentors);

router.route("/mentors/match")
  .get(protect, getMatchedMentors);

// Follow Mentor
router.route("/mentors/:id/follow")
  .post(protect, toggleFollowMentor);

// Rating
router.route("/mentors/:id/rate")
  .post(protect, rateMentor);

// Leaderboard
router.route("/leaderboard")
  .get(getLeaderboard);

export default router;
