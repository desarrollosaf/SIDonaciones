import { Router } from "express";
import { saveDonacion } from "../controllers/donaciones";

const router = Router();


router.post("/api/donacion/savedonacion/", saveDonacion)



export default router