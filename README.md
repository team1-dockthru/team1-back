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
GOOGLE_CLIENT_ID=your-google-client-id
CORS_ORIGIN=*
```

### 3. Prisma 설정

```bash
# Prisma Client 생성 (스키마 변경 후)
npx prisma generate

# 데이터베이스에 스키마 적용 (개발 환경)
npx prisma db push

# 마이그레이션 생성 및 적용 (프로덕션 권장)
npx prisma migrate dev --name migration_name

# Prisma Studio 실행 (데이터베이스 GUI)
npx prisma studio
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
├── config/          # 설정 파일 (database, env, swagger 등)
├── middlewares/     # 미들웨어 (인증, 에러 처리, 보안)
├── routes/          # 라우트
├── utils/           # 유틸리티 함수 (jwt, password)
└── modules/         # 기능 모듈
    ├── auth/        # 인증 모듈
    ├── challenges/  # 챌린지 모듈
    ├── work/        # 작업물 모듈
    └── health/      # 헬스 체크 모듈
```

## API 엔드포인트

### 인증 (Auth)

- `POST /auth/signup` - 회원가입
- `POST /auth/login` - 로그인
- `POST /auth/google` - Google 소셜 로그인
- `POST /auth/logout` - 로그아웃 (인증 필요)
- `GET /auth/me` - 현재 사용자 정보 조회 (인증 필요)

### 챌린지 (Challenges)

- `GET /challenges` - 챌린지 목록 조회 (필터링: userId, challengeStatus, field, docType)
- `GET /challenges/:id` - 챌린지 상세 조회
- `POST /challenges` - 챌린지 생성 (인증 필요)
- `PATCH /challenges/:id` - 챌린지 수정 (인증 필요)
- `DELETE /challenges/:id` - 챌린지 삭제 (인증 필요)

### 작업물 (Works)

- `GET /works` - 작업물 목록 조회 (필터링: challengeId, userId, workStatus)
- `GET /works/:id` - 작업물 상세 조회
- `POST /works` - 작업물 생성 (인증 필요)
- `PATCH /works/:id` - 작업물 수정 (인증 필요)
- `DELETE /works/:id` - 작업물 삭제 (인증 필요)

### 헬스 체크

- `GET /health` - 서버 상태 확인
- `GET /health/db` - 데이터베이스 연결 상태 확인

## 응답 형식

모든 API 응답은 다음 형식을 따릅니다:

```json
{
  "data": {
    // 응답 데이터
  }
}
```

에러 응답:

```json
{
  "message": "에러 메시지"
}
```
## 배포 (Render)

### 환경 변수 설정

Render 대시보드의 **Environment** 섹션에서 다음 환경 변수를 설정하세요:

**필수:**
- `JWT_SECRET` - JWT 토큰 서명 키
- `DATABASE_URL` - PostgreSQL 데이터베이스 연결 URL

**선택:**
- `GOOGLE_CLIENT_ID` - Google OAuth 클라이언트 ID
- `API_URL` - 배포된 API URL (Swagger 문서용)
- `CORS_ORIGIN` - CORS 허용 오리진 (기본값: `*`)

### 배포 확인

- API 서버: `https://your-app.onrender.com`
- Swagger 문서: `https://your-app.onrender.com/api-docs`
- 헬스 체크: `https://your-app.onrender.com/health/db`

