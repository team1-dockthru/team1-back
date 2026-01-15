# Team1 Dockthru-Backend

백엔드 API 서버 프로젝트입니다.

## 기술 스택

- **Node.js** - 런타임 환경
- **Express.js** - 웹 프레임워크
- **Prisma** - ORM
- **PostgreSQL** - 데이터베이스

## 프레임워크 및 도구 설치

### Express.js 설치

Express.js는 이미 `package.json`에 포함되어 있습니다. 의존성 설치 시 자동으로 설치됩니다:

```bash
npm install
```

프로젝트에서 Express 사용 예시:

```javascript
import express from "express";

const app = express();
app.use(express.json());
```

### PostgreSQL 설치

PostgreSQL은 관계형 데이터베이스입니다.

#### macOS

```bash
# Homebrew를 사용한 설치
brew install postgresql@15

# PostgreSQL 서비스 시작
brew services start postgresql@15
```

#### PostgreSQL 데이터베이스 생성

```bash
# PostgreSQL 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE your_database_name;

# 사용자 생성 (선택사항)
CREATE USER your_username WITH PASSWORD 'your_password';

# 종료
\q
```

#### DATABASE_URL 형식

`.env` 파일에 다음과 같은 형식으로 설정하세요:

```env
# 로컬 PostgreSQL
DATABASE_URL="postgresql://username:password@localhost:5432/database_name"

# 클라우드 PostgreSQL (예: Neon, Supabase)
DATABASE_URL="postgresql://username:password@host:5432/database_name?sslmode=require"
```

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

Prisma는 이 프로젝트의 ORM(Object-Relational Mapping)입니다.

#### Prisma 설치

Prisma는 이미 `package.json`에 포함되어 있습니다. 의존성 설치 시 자동으로 설치됩니다:

```bash
npm install
```

#### Prisma 초기 설정 (최초 1회)

```bash
# Prisma 초기화 (이미 설정되어 있으면 생략 가능)
npx prisma init
```

#### Prisma 클라이언트 생성

스키마 변경 후 Prisma Client를 생성해야 합니다:

```bash
npx prisma generate
```

#### 데이터베이스 마이그레이션

스키마(`prisma/schema.prisma`)를 수정한 후 마이그레이션을 실행합니다:

```bash
# 개발 환경에서 마이그레이션 생성 및 적용
npx prisma migrate dev --name migration_name

# 프로덕션 환경에서 마이그레이션 적용
npx prisma migrate deploy
```

#### Prisma Studio (데이터베이스 GUI)

데이터베이스를 시각적으로 확인하고 편집할 수 있습니다:

```bash
npx prisma studio
```

브라우저에서 `http://localhost:5555`로 접속하여 데이터베이스를 확인할 수 있습니다.

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
    └── auth/        # 인증 모듈
```

## API 엔드포인트

### 인증 (Auth)

- `POST /auth/signup` - 회원가입
- `POST /auth/login` - 로그인
- `POST /auth/google` - Google 소셜 로그인
- `POST /auth/logout` - 로그아웃 (인증 필요)
- `GET /auth/me` - 현재 사용자 정보 조회 (인증 필요)

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
