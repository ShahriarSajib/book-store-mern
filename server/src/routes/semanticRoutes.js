import { Router } from "express";

import {
  searchBooks,
} from "../controllers/semanticController.js";

const router = Router();

router.get("/", searchBooks);

export default router;
