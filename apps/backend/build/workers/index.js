"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
exports.dbWorker = void 0;
var cache_1 = require("../cache");
var firebase_1 = __importDefault(require("../firebase"));
/** This simulates a worker or cronjob that runs every minute
 ** It loops through the cache and stores all note content to db
 */
function dbWorker() {
    setInterval(function () {
        var notes = (0, cache_1.getAllFromCache)();
        var batch = firebase_1["default"].batch();
        if (notes.length) {
            //group all note content so you write as batch
            notes.forEach(function (note) {
                var docRef = firebase_1["default"].collection("notes").doc(note.id);
                batch.update(docRef, { content: note.content });
            });
            //write to db
            batch.commit().then(function () {
                console.log("Note contents written to db");
            })["catch"](function (err) {
                console.log("Failed to write batch files to db: ");
            });
        }
    }, 1000 * 60 * 60); //runs every
}
exports.dbWorker = dbWorker;
