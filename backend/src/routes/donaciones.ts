import { Router } from "express";
import { saveDonacion,getDonacion } from "../controllers/donaciones";

const router = Router();


router.post("/api/donacion/savedonacion/", saveDonacion)
router.get("/api/donacion/getdonacion/:rfc", getDonacion) 



export default router