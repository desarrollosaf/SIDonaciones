import { Router } from "express";


import { saveDonacion,getDonacion,validateToken,getAll,getExcelD} from "../controllers/donaciones";



const router = Router();

router.post("/api/donacion/savedonacion/", saveDonacion)

router.get("/api/donacion/getdonacion/:rfc", getDonacion) 

router.post("/api/donacion/validate/", validateToken)

router.get("/api/donacion/getall/", getAll) 
router.get("/api/donacion/getExcelD/", getExcelD) 


export default router