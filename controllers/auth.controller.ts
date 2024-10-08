import { Request, Response } from "express";
import prisma from "../configs/dbPrisma";
import bcryptjs from "bcryptjs";
import generateToken from "../utils/generateTokenAndSetCookie";

export const register = async (req: Request, res: Response) => {
	try {
		const { fullName, userName, password, confirmedPassword, gender } =
			req.body;
		if (!fullName || !userName || !password || !confirmedPassword || !gender)
			throw new Error("All fields are mandatory");

		if (password !== confirmedPassword)
			throw new Error("Passwords don't match");

		const user = await prisma.user.findUnique({ where: { userName } });

		if (user) throw new Error("User already registered");

		const salt = await bcryptjs.genSalt(10);
		const hashedPass = await bcryptjs.hash(password, salt);

		const boyProfilePic = `https://avatar.iran.liara.run/public/boy?username=${userName}`;
		const girlProfilePic = `https://avatar.iran.liara.run/public/girl?username=${userName}`;

		const newUser = await prisma.user.create({
			data: {
				fullName,
				userName,
				password: hashedPass,
				gender,
				profilePic: gender === "male" ? boyProfilePic : girlProfilePic
			}
		});

		if (newUser) {
			// generate token

			generateToken(newUser.id, res);

			res.status(201).json({
				user: {
					id: newUser.id,
					fullName: newUser.fullName,
					userName: newUser.userName,
					profilePic: newUser.profilePic
				},
				message: "Registered successfully",
				success: true
			});
		} else {
			throw new Error("Invalid user Data");
		}
	} catch (error: any) {
		console.log(error.stack);
		res.status(500).json({
			message: error.message,
			success: false
		});
	}
};

export const login = async (req: Request, res: Response) => {
	try {
		const { userName, password } = req.body;

		const user = await prisma.user.findUnique({ where: { userName } });
		if (!user) throw new Error("Invalid Credentials");

		const isPassMatched = await bcryptjs.compare(password, user.password);
		if (!isPassMatched) throw new Error("Invalid Credentials");

		generateToken(user.id, res);

		res.status(200).json({
			user: {
				id: user.id,
				fullName: user.fullName,
				userName: user.userName,
				profilePic: user.profilePic
			},
			message: "Logged In Successfully",
			success: true
		});
	} catch (error: any) {
		console.log(error.stack);
		res.status(500).json({
			message: error.message,
			success: false
		});
	}
};

export const logout = (req: Request, res: Response) => {
	try {
		res.cookie("jwt", "", { maxAge: 0 });
		res.status(200).json({
			message: "Logged out successfully",
			success: true
		});
	} catch (error: any) {
		console.log(error.stack);
		res.status(500).json({
			message: error.message,
			success: false
		});
	}
};

// Get Authenticated user we will use in frontend
export const getMe = async (req: Request, res: Response) => {
	try {
		const user = await prisma.user.findUnique({ where: { id: req.user.id } });

		if (!user) throw new Error("Please login to access");

		res.status(200).json({
			user: {
				id: user.id,
				fullName: user.fullName,
				userName: user.userName,
				profilePic: user.profilePic
			}
		});
	} catch (error: any) {
		console.log(error.stack);
		res.status(500).json({
			message: error.message,
			success: false
		});
	}
};
