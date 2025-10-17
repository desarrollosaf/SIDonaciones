"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const donaciones_1 = require("../controllers/donaciones");
const router = (0, express_1.Router)();
router.post("/api/donacion/savedonacion/", donaciones_1.saveDonacion);
router.get("/api/donacion/getdonacion/:rfc", donaciones_1.getDonacion);
router.post("/api/donacion/validate/", donaciones_1.validateToken);

exports.default = router;
