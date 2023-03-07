import express from "express";
import cors from "cors";
import expressWs from "express-ws";

import apiRoutes from "./routes";
import { dbWorker } from "./workers";

const app = express();
const PORT = 3001;
expressWs(app); 

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

//api route
app.use("/api", apiRoutes);

//health check
app.get("/api/ping", (_req, res) => {
  res.status(200).json({ message: "pong" });
});

dbWorker();

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${PORT}`);
});
