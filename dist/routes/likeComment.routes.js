"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const likeComment_controller_1 = require("../controllers/likeComment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Like routes - no authentication required
router.post('/opinions/:opinionId/like', likeComment_controller_1.toggleLike);
router.get('/opinions/:opinionId/like-status', likeComment_controller_1.getLikeStatus);
// Comment routes - authentication required for creation
router.post('/opinions/:opinionId/comments', auth_middleware_1.authenticate, likeComment_controller_1.createComment);
router.get('/opinions/:opinionId/comments', likeComment_controller_1.getComments);
router.put('/opinions/comments/:commentId', likeComment_controller_1.updateComment);
router.delete('/opinions/comments/:commentId', likeComment_controller_1.deleteComment);
exports.default = router;
