"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const opinion_controller_1 = require("../controllers/opinion.controller");
const router = express_1.default.Router();
router.post('/create', opinion_controller_1.createOpinion);
router.get('/getAllOpinions', opinion_controller_1.getOpinions);
router.get('/related', opinion_controller_1.getRelatedOpinions);
router.get('/getSingleOpinion/:id', opinion_controller_1.getOpinionById);
router.put('/:id', opinion_controller_1.updateOpinion);
router.delete('/:id', opinion_controller_1.deleteOpinion);
exports.default = router;
