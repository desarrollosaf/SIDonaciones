import { Router } from "express";

import { saveDonacion,getDonacion,validateToken} from "../controllers/donaciones";

const router = Router();

router.post("/api/donacion/savedonacion/", saveDonacion)
router.get("/api/donacion/getdonacion/:rfc", getDonacion) 
router.post("/api/donacion/validate/", validateToken)


export default router