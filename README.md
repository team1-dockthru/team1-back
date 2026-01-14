# Team1 Dockthru-Backend

백엔드 API 서버 프로젝트입니다.

## 기술 스택

- **Node.js** - 런타임 환경
- **Express.js** - 웹 프레임워크
- **Prisma** - ORM
- **PostgreSQL** - 데이터베이스

## 설치 및 실행

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 다음 변수들을 설정하세요:

```env
PORT=4000
NODE_ENV=development
JWT_SECRET=your-secret-key
DATABASE_URL=your-database-url
```

### 3. Prisma 설정

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 데이터베이스 마이그레이션 (필요시)
npx prisma migrate dev
```

### 4. 서버 실행

```bash
# 개발 모드
npm run dev

# 프로덕션 모드
npm start
```

## 프로젝트 구조

```
src/
├── config/          # 설정 파일
├── middlewares/     # 미들웨어
├── routes/          # 라우트
├── utils/           # 유틸리티 함수
└── modules/         # 모듈
```
