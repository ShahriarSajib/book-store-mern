import { Router } from "express";

import {
  getTrending,
} from "../controllers/trendingController.js";

const router = Router();

router.get("/", getTrending);

export default router;
