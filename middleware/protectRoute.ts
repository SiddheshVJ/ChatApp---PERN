import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import prisma from "../configs/dbPrisma";

interface DecodedToken extends JwtPayload {
	userId: string;
}

declare global {
	namespace Express {
		export interface Request {
			user: {
				id: string;
			};
		}
	}
}


export const protectRoute = async (
	req: Request,
	res: Response,
	next: NextFunction
) => {
	try {
		const token = req.cookies.jwt;
		if (!token) throw new Error("Unauthorized");
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as DecodedToken;

		if (!decoded) throw new Error("Unauthorized");

		const user = await prisma.user.findUnique({
			where: { id: decoded.userId },
			select: { id: true, userName: true, fullName: true, profilePic: true }
		});

		if (!user) throw new Error("User not found");

		req.user = user;

		next();
	} catch (error: any) {
		console.log(error.stack);
		res.status(500).json({
			message: error.message,
			success: false
		});
	}
};
