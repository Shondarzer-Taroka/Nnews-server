"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const likeComment_controller_1 = require("../controllers/likeComment.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = express_1.default.Router();
// Like routes
router.post('/:entityType/:entityId/like', auth_middleware_1.authenticate, likeComment_controller_1.toggleLike);
router.get('/:entityType/:entityId/like-status', auth_middleware_1.authenticate, likeComment_controller_1.getLikeStatus);
// Comment routes
router.post('/:entityType/:entityId/comments', auth_middleware_1.authenticate, likeComment_controller_1.createComment);
router.get('/:entityType/:entityId/comments', likeComment_controller_1.getComments);
router.put('/comments/:commentId', auth_middleware_1.authenticate, likeComment_controller_1.updateComment);
router.delete('/comments/:commentId', auth_middleware_1.authenticate, likeComment_controller_1.deleteComment);
exports.default = router;
