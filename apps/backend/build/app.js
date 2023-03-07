"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
exports.__esModule = true;
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var express_ws_1 = __importDefault(require("express-ws"));
var routes_1 = __importDefault(require("./routes"));
var workers_1 = require("./workers");
var app = (0, express_1["default"])();
var PORT = 3001;
(0, express_ws_1["default"])(app);
app.use(express_1["default"].json());
app.use(express_1["default"].urlencoded({ extended: false }));
app.use((0, cors_1["default"])());
//api route
app.use("/api", routes_1["default"]);
//health check
app.get("/api/ping", function (_req, res) {
    res.status(200).json({ message: "pong" });
});
(0, workers_1.dbWorker)();
app.listen(PORT, function () {
    console.log("\u26A1\uFE0F[server]: Server is running at https://localhost:" + PORT);
});
