import app from "./app.js";
import { ENV } from "./config/env.js";

const PORT = Number(process.env.PORT) || 4000;

app.listen(PORT, () => {
  console.log(`🚀 개발 서버가 ${PORT}번 포트에서 실행 중입니다.`);
});