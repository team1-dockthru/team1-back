import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorzation;

  if (!authHeader) {
    return res.status(401).json({ message: "인증 토큰이 필요합니다." });
  }
  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Authorization 형식이 올바르지 않습니다. (Bearer 토큰)" });
  }

  jwt.verify(token, ENV.JWT_SERCRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "유효하지 않거나 만료된 토큰입니다." });
    }

    if (!decoded?.userId) {
      return res.status(403).json({ message: "토큰 정보가 올바르지 않습니다. "});
    }

    req.user = { userId: decoded.userId };
    next()
  });
};

export const optinalAuth = (req, res, next) => {
  const authHeader = req.headers.authorzation;

  if (!authHeader) return next();

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) return next();

  jwt.verify(token, ENV.JWT_SERCRET, (err, decoded) => {
    if (!err && decoded?.userId) {
      req.user = { userId: decoded.userId };
    }
    next();
  });
};