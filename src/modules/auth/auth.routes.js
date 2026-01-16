import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { signup, login, googleLogin, logout, getMe } from "./auth.controller.js";
import { validateLogin, validateSignup } from "./auth.validator.js";
import { authLimiter } from "../../middlewares/security.middleware.js";

const router = Router();

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     tags: [Auth]
 *     summary: 회원가입
 *     description: 새로운 사용자를 등록합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SignupRequest'
 *           examples:
 *             example1:
 *               summary: 일반 회원가입
 *               value:
 *                 email: "user@example.com"
 *                 password: "password123"
 *                 nickname: "홍길동"
 *                 profileImage: "USER"
 *     responses:
 *       201:
 *         description: 회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             examples:
 *               success:
 *                 summary: 회원가입 성공 예제
 *                 value:
 *                   data:
 *                     user:
 *                       id: 1
 *                       email: "user@example.com"
 *                       nickname: "홍길동"
 *                       profileImage: "USER"
 *                       role: "USER"
 *                       grade: "NORMAL"
 *                       challengeParticipations: 0
 *                       recommendedCount: 0
 *                       createdAt: "2024-01-01T00:00:00.000Z"
 *                       updatedAt: "2024-01-01T00:00:00.000Z"
 *                     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       409:
 *         description: 이미 사용 중인 이메일
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               conflict:
 *                 summary: 이메일 중복 예제
 *                 value:
 *                   message: "이미 사용 중인 이메일입니다."
 *       429:
 *         description: 요청 제한 초과
 */
router.post("/signup", authLimiter, validateSignup, signup);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: 로그인
 *     description: 이메일과 비밀번호로 로그인합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           examples:
 *             example1:
 *               summary: 로그인 요청 예제
 *               value:
 *                 email: "user@example.com"
 *                 password: "password123"
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             examples:
 *               success:
 *                 summary: 로그인 성공 예제
 *                 value:
 *                   data:
 *                     user:
 *                       id: 1
 *                       email: "user@example.com"
 *                       nickname: "홍길동"
 *                       profileImage: "USER"
 *                       role: "USER"
 *                       grade: "NORMAL"
 *                       challengeParticipations: 0
 *                       recommendedCount: 0
 *                     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 summary: 인증 실패 예제
 *                 value:
 *                   message: "이메일 또는 비밀번호가 올바르지 않습니다."
 *       429:
 *         description: 요청 제한 초과
 */
router.post("/login", authLimiter, validateLogin, login);

/**
 * @swagger
 * /auth/google:
 *   post:
 *     tags: [Auth]
 *     summary: Google 소셜 로그인
 *     description: Google ID 토큰을 사용하여 로그인합니다.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GoogleLoginRequest'
 *           examples:
 *             example1:
 *               summary: Google 로그인 요청 예제
 *               value:
 *                 idToken: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1NiJ9.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIxMjM0NTY3ODkwIiwiYXVkIjoiMTIzNDU2Nzg5MCIsInN1YiI6IjEyMzQ1Njc4OTAiLCJlbWFpbCI6InVzZXJAZXhhbXBsZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwibmFtZSI6IkhvbmcgR2lsIERvbmciLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMDAwMH0..."
 *     responses:
 *       200:
 *         description: 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             examples:
 *               success:
 *                 summary: Google 로그인 성공 예제
 *                 value:
 *                   data:
 *                     user:
 *                       id: 1
 *                       email: "user@gmail.com"
 *                       nickname: "홍길동"
 *                       profileImage: "USER"
 *                       role: "USER"
 *                       grade: "NORMAL"
 *                       challengeParticipations: 0
 *                       recommendedCount: 0
 *                     token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               badRequest:
 *                 summary: 잘못된 요청 예제
 *                 value:
 *                   message: "idToken이 필요합니다."
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 summary: 인증 실패 예제
 *                 value:
 *                   message: "유효하지 않은 Google 토큰입니다."
 */
router.post("/google", googleLogin);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: 로그아웃
 *     description: 사용자를 로그아웃합니다. (클라이언트에서 토큰 삭제 필요)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 로그아웃 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "로그아웃되었습니다."
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/logout", authenticateToken, logout);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     tags: [User]
 *     summary: 현재 사용자 정보 조회
 *     description: 인증된 사용자의 정보를 조회합니다.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 사용자 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *             examples:
 *               success:
 *                 summary: 사용자 정보 조회 성공 예제
 *                 value:
 *                   data:
 *                     user:
 *                       id: 1
 *                       email: "user@example.com"
 *                       nickname: "홍길동"
 *                       profileImage: "USER"
 *                       role: "USER"
 *                       grade: "NORMAL"
 *                       challengeParticipations: 5
 *                       recommendedCount: 3
 *                       createdAt: "2024-01-01T00:00:00.000Z"
 *                       updatedAt: "2024-01-01T00:00:00.000Z"
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 summary: 인증 실패 예제
 *                 value:
 *                   message: "인증 정보가 올바르지 않습니다."
 *       404:
 *         description: 사용자를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFound:
 *                 summary: 사용자 없음 예제
 *                 value:
 *                   message: "사용자를 찾을 수 없습니다."
 */
router.get("/me", authenticateToken, getMe);

export default router;
