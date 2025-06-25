"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const user_controller_1 = require("../controllers/user.controller");
const router = express_1.default.Router();
router.post('/register', user_controller_1.register);
router.post('/login', passport_1.default.authenticate('local', { session: false }), user_controller_1.login);
router.post('/logout', user_controller_1.logout);
router.get('/logInUser', user_controller_1.logInUser);
exports.default = router;
// router.get('/logInUser',logInUser)
