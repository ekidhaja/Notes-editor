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
exports.__esModule = true;
exports.getAllFromCache = exports.getFromCache = exports.addToCache = void 0;
var Y = __importStar(require("yjs"));
var core_1 = require("@slate-yjs/core");
/**
 * An in-memory storage of Y.Docs. One Y.Doc per note.
 * This stores notes currently being edited in memory
 * It is retrieved from db when someone connects to a note for the first time
*/
var cache = {};
function addToCache(key, value) {
    cache[key] = value;
}
exports.addToCache = addToCache;
function getFromCache(key) {
    return cache[key];
}
exports.getFromCache = getFromCache;
function getAllFromCache() {
    var data = [];
    //loop through cache
    Object.entries(cache).forEach(function (entry) {
        //get doc content and convert to slate
        var sharedType = entry[1].get("content", Y.XmlText);
        var content = (0, core_1.yTextToSlateElement)(sharedType).children;
        //push to array
        data.push({ id: entry[0], content: content });
    });
    return data;
}
exports.getAllFromCache = getAllFromCache;
