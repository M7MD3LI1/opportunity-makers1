import { Request, Response, NextFunction } from "express";
import { verifyToken, JwtPayload } from "../utils/jwt";
import prisma from "../config/db";

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "Access denied. No token provided." });
    return;
  }

  try {
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);
    req.user = decoded;

    // Update lastActive in the background
    (prisma.user as any).update({
      where: { id: Number(decoded.userId) },
      data: { lastActive: new Date() }
    }).catch((err: any) => console.error("Update lastActive error:", err));

    next();
  } catch (error) {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};
