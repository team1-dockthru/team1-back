import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "인증 토큰이 필요합니다." });
  }

  // "Bearer <token>" 형식만 허용
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
    req.user = payload; // { userId: ... }
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
