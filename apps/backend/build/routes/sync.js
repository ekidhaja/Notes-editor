"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var core_1 = require("@slate-yjs/core");
var express_1 = __importDefault(require("express"));
var Y = __importStar(require("yjs"));
var utils_1 = require("../utils");
var cache_1 = require("../cache");
// Patch `express.Router` to support `.ws()` without needing to pass around a `ws`-ified app.
// https://github.com/HenningM/express-ws/issues/86
// eslint-disable-next-line @typescript-eslint/no-var-requires
var patch = require("express-ws/lib/add-ws-method");
patch["default"](express_1["default"].Router);
var router = express_1["default"].Router();
/**
 * An in-memory storage that maintains key/value pairs of websocket clients connected to a particular note.
*/
var clients = {};
var syncHandler = function (ws, req) { return __awaiter(void 0, void 0, void 0, function () {
    var noteId, doc, note, doc, sharedType;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                noteId = req.params.id;
                console.log("Client connected");
                //add new client to noteId array
                clients[noteId] ? clients[noteId].push(ws) : clients[noteId] = [ws];
                if (!(0, cache_1.getFromCache)(noteId)) return [3 /*break*/, 1];
                doc = (0, cache_1.getFromCache)(noteId);
                ws.send(Y.encodeStateAsUpdate(doc));
                return [3 /*break*/, 3];
            case 1: return [4 /*yield*/, (0, utils_1.getNote)(noteId)];
            case 2:
                note = _a.sent();
                if (!note)
                    return [2 /*return*/];
                doc = new Y.Doc();
                (0, cache_1.addToCache)(noteId, doc);
                sharedType = doc.get("content", Y.XmlText);
                sharedType.applyDelta((0, core_1.slateNodesToInsertDelta)(note.content));
                // send the encoded ydoc to client
                ws.send(Y.encodeStateAsUpdate(doc));
                _a.label = 3;
            case 3:
                // Receive note edits from clients
                ws.on("message", function (data) {
                    //get ydoc from in-memory storage
                    var doc = (0, cache_1.getFromCache)(noteId);
                    // Merge data using yjs.
                    Y.applyUpdate(doc, new Uint8Array(data));
                    //masterDocs[noteId] = doc;
                    // Send update to all clients with the new doc
                    clients[noteId].forEach(function (client) {
                        client.send(Y.encodeStateAsUpdate(doc));
                    });
                });
                //clean up on client disconnection
                ws.on("close", function () {
                    console.log("Client disconnected");
                    //filter out diconnected client
                    clients[noteId] = clients[noteId].filter(function (client) { return client !== ws; });
                    // //delete endoced Ydoc from memory if all clinets are disconnected
                    // if (!clients[noteId].length) {
                    //   console.log("All clients disconnected. Deleting note from in-memory store"); 
                    //   delete masterDocs[noteId];
                    // }
                });
                return [2 /*return*/];
        }
    });
}); };
router.ws("/:id", syncHandler);
exports["default"] = router;
