import { Router } from "express";

import { saveDonacion,getDonacion,validateToken} from "../controllers/donaciones";

const router = Router();

router.post("/api/donacion/savedonacion/", saveDonacion)
router.get("/api/donacion/getdonacion/:rfc", getDonacion) 
router.get("/api/donacion/validate/:rfc", validateToken)


export default router