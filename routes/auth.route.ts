import { Router } from "express";
import { register, login, logout, getMe } from "../controllers/auth.controller";
import { protectRoute } from "../middleware/protectRoute";

let authRoute = Router();

authRoute.get("/me", protectRoute, getMe);
authRoute.post("/login", login);
authRoute.post("/register", register);
authRoute.post("/logout", logout);

export default authRoute;
