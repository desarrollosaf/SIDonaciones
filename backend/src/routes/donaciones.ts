import { Router } from "express";
import { saveDonacion } from "../controllers/donaciones";
import { validateToken } from "../controllers/donaciones";

const router = Router();


router.post("/api/donacion/savedonacion/", saveDonacion)
router.post("/api/donacion/validate/", validateToken)

export default router