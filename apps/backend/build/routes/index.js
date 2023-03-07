"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var notes_1 = __importDefault(require("./notes"));
var sync_1 = __importDefault(require("./sync"));
var router = express_1["default"].Router();
router.use("/notes", notes_1["default"]);
router.use("/sync", sync_1["default"]);
exports["default"] = router;
