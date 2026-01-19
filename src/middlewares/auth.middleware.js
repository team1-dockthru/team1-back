import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { prisma } from "../config/prisma.js";

export const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "인증 토큰이 필요합니다." });
  }

  const prefix = "Bearer ";
  if (!authHeader.startsWith(prefix)) {
    return res
      .status(401)
      .json({
        message: "Authorization 형식이 올바르지 않습니다. (Bearer 토큰)",
      });
  }

  const token = authHeader.slice(prefix.length).trim();

  if (!token) {
    return res.status(401).json({ message: "인증 토큰이 필요합니다." });
  }

  try {
    const payload = jwt.verify(token, ENV.JWT_SECRET);
    
    if (!payload.userId) {
      return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { tokenVersion: true },
    });

    if (!user) {
      return res.status(404).json({ message: "사용자를 찾을 수 없습니다." });
    }

    const tokenVersion = payload.tokenVersion ?? 0;
    
    if (tokenVersion !== user.tokenVersion) {
      return res.status(403).json({ 
        message: "토큰이 만료되었습니다. 다시 로그인해주세요.",
      });
    }

    req.user = { userId: payload.userId, type: payload.type, role: payload.role };
    next();
  } catch (err) {
    return res.status(403).json({ message: "유효하지 않은 토큰입니다." });
  }
};

export const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) return next();

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) return next();

  jwt.verify(token, ENV.JWT_SECRET, (err, decoded) => {
    if (!err && decoded?.userId) {
      req.user = { userId: decoded.userId };
    }
    next();
  });
};