"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var firebase_admin_1 = __importDefault(require("firebase-admin"));
firebase_admin_1["default"].initializeApp({
    credential: firebase_admin_1["default"].credential.cert("./serviceAccountKey.json"),
    databaseURL: "https://editor-project99261.firebaseio.com"
});
exports["default"] = firebase_admin_1["default"].firestore();
