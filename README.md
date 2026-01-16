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

## 미들웨어

프로젝트에서 사용되는 미들웨어와 그 작동 방식입니다.

### 1. 인증 미들웨어 (auth.middleware.js)

#### `authenticateToken`
- **역할**: JWT 토큰을 검증하여 인증된 사용자만 접근할 수 있도록 보호합니다.
- **작동 방식**:
  1. 요청 헤더에서 `Authorization` 헤더를 확인합니다.
  2. `Bearer` 형식의 토큰인지 검증합니다.
  3. JWT 토큰을 검증하여 유효성을 확인합니다.
  4. 데이터베이스에서 사용자의 `tokenVersion`을 확인하여 토큰 무효화 여부를 체크합니다 (로그아웃 시 토큰 무효화).
  5. 검증이 성공하면 `req.user`에 사용자 정보를 추가하고 다음 미들웨어로 진행합니다.
- **사용 위치**: 인증이 필요한 API 엔드포인트에 적용됩니다.

#### `optionalAuth`
- **역할**: 선택적 인증 미들웨어로, 토큰이 있으면 사용자 정보를 추가하고 없어도 통과시킵니다.
- **작동 방식**:
  1. `Authorization` 헤더가 없으면 바로 다음 미들웨어로 진행합니다.
  2. 토큰이 있으면 검증을 시도하고, 유효한 경우 `req.user`에 사용자 정보를 추가합니다.
- **사용 위치**: 인증이 선택적인 API 엔드포인트에 적용됩니다.

### 2. 에러 처리 미들웨어 (error.middleware.js)

#### `errorMiddleware`
- **역할**: 애플리케이션에서 발생한 모든 에러를 일관된 형식으로 처리합니다.
- **작동 방식**:
  1. 에러 객체에서 `status` 코드를 추출합니다 (기본값: 500).
  2. 에러 메시지를 추출합니다 (기본값: "Internal Server Error").
  3. 적절한 HTTP 상태 코드와 함께 JSON 형식으로 에러 응답을 반환합니다.
- **사용 위치**: 모든 라우트 핸들러 다음에 위치하여 모든 에러를 캐치합니다.

### 3. 보안 미들웨어 (security.middleware.js)

#### `securityHeaders`
- **역할**: Helmet을 사용하여 보안 관련 HTTP 헤더를 설정합니다.
- **작동 방식**:
  1. Content Security Policy (CSP)를 설정하여 XSS 공격을 방지합니다.
  2. 다양한 보안 헤더를 자동으로 추가합니다.
  3. `crossOriginEmbedderPolicy`는 비활성화되어 있습니다.
- **사용 위치**: 애플리케이션의 최상위 레벨에서 모든 요청에 적용됩니다.

#### `apiLimiter`
- **역할**: 일반 API 엔드포인트에 대한 Rate Limiting을 적용합니다.
- **작동 방식**:
  1. 15분 시간 윈도우 내에서 IP 주소당 최대 100회 요청을 허용합니다.
  2. 제한을 초과하면 429 상태 코드와 함께 에러 메시지를 반환합니다.
  3. 표준 Rate Limit 헤더를 응답에 포함합니다.
- **사용 위치**: 일반 API 엔드포인트에 적용됩니다.

#### `authLimiter`
- **역할**: 인증 관련 API 엔드포인트에 대한 엄격한 Rate Limiting을 적용합니다.
- **작동 방식**:
  1. 15분 시간 윈도우 내에서 IP 주소당 최대 5회 요청을 허용합니다.
  2. 제한을 초과하면 429 상태 코드와 함께 에러 메시지를 반환합니다.
  3. 브루트 포스 공격을 방지하기 위해 일반 API보다 더 엄격한 제한을 적용합니다.
- **사용 위치**: 인증 관련 API 엔드포인트 (`/auth`)에 적용됩니다.

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
## Render 배포 가이드

### 1. Render.com 설정

1. [Render.com](https://render.com)에 로그인
2. **New +** → **Web Service** 선택
3. GitHub 저장소 연결: `team1-dockthru/team1-back`
4. `render.yaml` 파일이 자동으로 인식됩니다

### 2. 환경 변수 설정

Render 대시보드의 **Environment** 섹션에서 다음 환경 변수를 설정해야 합니다:

#### 필수 환경 변수

- `JWT_SECRET` - JWT 토큰 서명에 사용할 시크릿 키 (예: `your-super-secret-jwt-key-here`)
- `DATABASE_URL` - PostgreSQL 데이터베이스 연결 URL
  - Render에서 PostgreSQL 데이터베이스를 생성하면 자동으로 제공됩니다
  - 또는 외부 PostgreSQL 서비스(Neon, Supabase 등)의 연결 URL 사용

#### 선택적 환경 변수

- `GOOGLE_CLIENT_ID` - Google OAuth 클라이언트 ID (Google 로그인 사용 시)
- `API_URL` - 배포된 API URL (Swagger 문서용, 예: `https://team1-back-1.onrender.com`)
- `CORS_ORIGIN` - CORS 허용 오리진 (기본값: `*`)

### 3. PostgreSQL 데이터베이스 생성

1. Render 대시보드에서 **New +** → **PostgreSQL** 선택
2. 데이터베이스 이름 설정
3. 생성된 데이터베이스의 **Internal Database URL** 또는 **External Database URL**을 복사
4. Web Service의 `DATABASE_URL` 환경 변수에 설정

### 4. 배포 확인

배포가 완료되면:

- API 서버: `https://team1-back-1.onrender.com`
- Swagger 문서: `https://team1-back-1.onrender.com/api-docs`
- 헬스 체크: `https://team1-back-1.onrender.com/health/db`

### 5. 문제 해결

#### 환경 변수 에러

```
Error: JWT_SECRET 환경 변수가 설정되지 않았습니다.
```

**해결 방법**: Render 대시보드의 **Environment** 섹션에서 `JWT_SECRET` 환경 변수를 추가하세요.

#### 데이터베이스 연결 에러

**해결 방법**: 
1. PostgreSQL 데이터베이스가 생성되었는지 확인
2. `DATABASE_URL` 환경 변수가 올바르게 설정되었는지 확인
3. 마이그레이션이 실행되었는지 확인 (`npx prisma migrate deploy`는 빌드 시 자동 실행됨)

#### 빌드 에러

**해결 방법**:
- `render.yaml`의 `buildCommand`가 올바른지 확인
- `package-lock.json` 파일이 커밋되었는지 확인
