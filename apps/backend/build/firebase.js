"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var firebase_admin_1 = __importDefault(require("firebase-admin"));
var dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
var serviceAccountKey = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
firebase_admin_1["default"].initializeApp({
    credential: firebase_admin_1["default"].credential.cert(serviceAccountKey),
    databaseURL: "https://editor-project99261.firebaseio.com"
});
exports["default"] = firebase_admin_1["default"].firestore();
