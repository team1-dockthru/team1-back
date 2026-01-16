import app from "./app.js";
import { ENV } from "./config/env.js";

const PORT = ENV.PORT;

app.listen(PORT, () => {
  console.log(`🚀 개발 서버가 http://localhost:${PORT} 에서 실행 중입니다.`);
});