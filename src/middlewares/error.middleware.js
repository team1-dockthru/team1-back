export default function errorMiddleware(err, req, res, next) {
  console.error("Error:", err);

  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  // 개발 환경에서만 스택 트레이스 포함
  const response = {
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  res.status(status).json(response);
}