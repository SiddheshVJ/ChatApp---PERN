import { Router } from "express";
import { sendMsg } from "../controllers/message.controller";

let messageRoute = Router();

messageRoute.get("/send-msg", sendMsg);


export default messageRoute;
