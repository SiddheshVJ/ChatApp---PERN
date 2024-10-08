import express from "express";
import { configDotenv } from "dotenv";
import cookieParser from "cookie-parser";

import authRoute from "./routes/auth.route";
import messageRoute from "./routes/message.routes";

configDotenv();
const app = express();

app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
	res.send("Hello");
});

app.use("/api/auth", authRoute);

app.use("/api/messages", messageRoute);

app.listen(8000, () => {
	console.log("Server is running on 8000 port.");
});
