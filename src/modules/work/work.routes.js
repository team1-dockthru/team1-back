import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { create, getById, list, update, remove } from "./work.controller.js";

const router = Router();

/**
 * @swagger
 * /works:
 *   get:
 *     tags: [Work]
 *     summary: 작업물 목록 조회
 *     description: 작업물 목록을 조회합니다. 필터링과 페이지네이션을 지원합니다.
 *     parameters:
 *       - in: query
 *         name: challengeId
 *         schema:
 *           type: integer
 *         description: 챌린지 ID로 필터링
 *         example: 1
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: 작성자 사용자 ID로 필터링
 *         example: 1
 *       - in: query
 *         name: workStatus
 *         schema:
 *           type: string
 *           enum: [draft, done]
 *         description: 작업물 상태로 필터링
 *         example: done
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 페이지 번호 (기본값: 1)
 *         example: 1
 *     responses:
 *       200:
 *         description: 작업물 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkListResponse'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", list);

/**
 * @swagger
 * /works/{id}:
 *   get:
 *     tags: [Work]
 *     summary: 작업물 상세 조회
 *     description: 특정 작업물의 상세 정보를 조회합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 작업물 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 작업물 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkResponse'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 작업물을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", getById);

/**
 * @swagger
 * /works:
 *   post:
 *     tags: [Work]
 *     summary: 작업물 생성
 *     description: 새로운 작업물을 생성합니다. 인증이 필요합니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateWorkRequest'
 *     responses:
 *       201:
 *         description: 작업물 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkResponse'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", authenticateToken, create);

/**
 * @swagger
 * /works/{id}:
 *   patch:
 *     tags: [Work]
 *     summary: 작업물 수정
 *     description: 작업물을 수정합니다. 본인 작업물만 수정 가능합니다. 인증이 필요합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 작업물 ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateWorkRequest'
 *     responses:
 *       200:
 *         description: 작업물 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/WorkResponse'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 수정 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 작업물을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/:id", authenticateToken, update);

/**
 * @swagger
 * /works/{id}:
 *   delete:
 *     tags: [Work]
 *     summary: 작업물 삭제
 *     description: 작업물을 삭제합니다. 본인 작업물만 삭제 가능합니다. 인증이 필요합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 작업물 ID
 *         example: 1
 *     responses:
 *       204:
 *         description: 작업물 삭제 성공
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: 삭제 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 작업물을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", authenticateToken, remove);

export default router;
