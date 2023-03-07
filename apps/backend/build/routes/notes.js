"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var utils_1 = require("../utils");
var firebase_1 = __importDefault(require("../firebase"));
// Patch `express.Router` to support `.ws()` without needing to pass around a `ws`-ified app.
// https://github.com/HenningM/express-ws/issues/86
// eslint-disable-next-line @typescript-eslint/no-var-requires
var patch = require("express-ws/lib/add-ws-method");
patch["default"](express_1["default"].Router);
var router = express_1["default"].Router();
var clients = [];
var notesHandler = function (_req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var notes;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, utils_1.getNotes)()];
            case 1:
                notes = _a.sent();
                res.json({ notes: notes });
                return [2 /*return*/];
        }
    });
}); };
var notesHandlerWS = function (ws, req) { return __awaiter(void 0, void 0, void 0, function () {
    var notes;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, utils_1.getNotes)()];
            case 1:
                notes = _a.sent();
                //send notes to connected clients
                ws.send(JSON.stringify(notes));
                //push connected client to clients array
                clients.push(ws);
                //filter out client from clients arrays on disconnection
                ws.on("close", function () {
                    clients = clients.filter(function (client) { return client !== ws; });
                });
                //listen for changes in notes collection and send to all connected clients
                firebase_1["default"].collection("notes")
                    .onSnapshot(function (snapshot) {
                    var notes = [];
                    var notesRes = [];
                    //loop through snapshot
                    snapshot === null || snapshot === void 0 ? void 0 : snapshot.forEach(function (doc) {
                        var _a = doc.data(), title = _a.title, content = _a.content;
                        notes.push({ id: doc.id, title: title });
                        notesRes.push({ id: doc.id, title: title, content: content });
                    });
                    // Send notes to all clients
                    clients.forEach(function (client) {
                        client.send(JSON.stringify(notes));
                    });
                }, function (error) {
                    console.log("Error listening to firestore changes: ", error.message);
                });
                return [2 /*return*/];
        }
    });
}); };
var noteHandler = function (ws, req) {
    ws.on("message", function () { return __awaiter(void 0, void 0, void 0, function () {
        var note;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, utils_1.getNote)(req.params.id)];
                case 1:
                    note = _a.sent();
                    return [2 /*return*/, ws.send(JSON.stringify(note))];
            }
        });
    }); });
};
var addNoteHandler = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var title, id, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                title = req.body.title;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, (0, utils_1.addNote)(title)];
            case 2:
                id = _a.sent();
                res.status(200).json({ id: id });
                return [3 /*break*/, 4];
            case 3:
                err_1 = _a.sent();
                console.log("error adding note fetching note by id");
                res.status(400).json(null);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
var updateNoteHandler = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var resObj, err_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, utils_1.updateNote)(req.params.id, req.body.title)];
            case 1:
                resObj = _a.sent();
                if (resObj) {
                    res.status(200).json(resObj);
                }
                else {
                    throw Error();
                }
                return [3 /*break*/, 3];
            case 2:
                err_2 = _a.sent();
                console.log("error updating note title");
                res.status(400).json(null);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
var deleteNoteHandler = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var resObj, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, utils_1.deleteNote)(req.params.id)];
            case 1:
                resObj = _a.sent();
                if (resObj) {
                    res.status(200).json(resObj);
                }
                else {
                    throw Error();
                }
                return [3 /*break*/, 3];
            case 2:
                err_3 = _a.sent();
                console.log("error deleting note");
                res.status(400).json(null);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
router.get("/", notesHandler);
router.post('/', addNoteHandler);
router.patch('/:id', updateNoteHandler);
router["delete"]('/:id', deleteNoteHandler);
router.ws("/:id", noteHandler);
router.ws("/", notesHandlerWS);
exports["default"] = router;
