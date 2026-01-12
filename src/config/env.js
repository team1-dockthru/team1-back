import dotenv from "dotenv";

dotenv.config();

// 필수 환경 변수 검증
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET 환경 변수가 설정되지 않았습니다.");
}

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL 환경 변수가 설정되지 않았습니다.");
}

export const ENV = {
  PORT: process.env.PORT || 4000,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV || "development",
  DATABASE_URL: process.env.DATABASE_URL,
};
