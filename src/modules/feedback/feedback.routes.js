import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { create, list, update, remove } from "./feedback.controller.js";

export const feedbackByWorkRouter = Router({ mergeParams: true });
const router = Router();

/**
 * @swagger
 * /works/{workId}/feedbacks:
 *   get:
 *     tags: [Feedback]
 *     summary: 피드백 목록 조회
 *     description: 피드백 목록을 조회합니다. 필터링과 페이지네이션을 지원합니다.
 *     parameters:
 *       - in: path
 *         name: workId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 작업물 ID
 *         example: 1
 *       - in: query
 *         name: workId
 *         schema:
 *           type: integer
 *         description: 작업물 ID로 필터링
 *         example: 1
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: 작성자 사용자 ID로 필터링
 *         example: 1
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: "페이지 번호 (기본값: 1, 3개씩)"
 *         example: 1
 *     responses:
 *       200:
 *         description: 피드백 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeedbackListResponse'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
feedbackByWorkRouter.get("/", list);

/**
 * @swagger
 * /works/{workId}/feedbacks:
 *   post:
 *     tags: [Feedback]
 *     summary: 피드백 생성
 *     description: 새로운 피드백을 생성합니다. 인증이 필요합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: workId
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
 *             $ref: '#/components/schemas/CreateFeedbackRequest'
 *     responses:
 *       201:
 *         description: 피드백 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeedbackResponse'
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
feedbackByWorkRouter.post("/", authenticateToken, create);

/**
 * @swagger
 * /feedbacks/{id}:
 *   patch:
 *     tags: [Feedback]
 *     summary: 피드백 수정
 *     description: 피드백을 수정합니다. 본인 피드백만 수정 가능합니다. 인증이 필요합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 피드백 ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateFeedbackRequest'
 *     responses:
 *       200:
 *         description: 피드백 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/FeedbackResponse'
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
 *         description: 피드백을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/:id", authenticateToken, update);

/**
 * @swagger
 * /feedbacks/{id}:
 *   delete:
 *     tags: [Feedback]
 *     summary: 피드백 삭제
 *     description: 피드백을 삭제합니다. 본인 피드백만 삭제 가능합니다. 인증이 필요합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 피드백 ID
 *         example: 1
 *     responses:
 *       204:
 *         description: 피드백 삭제 성공
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
 *         description: 피드백을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", authenticateToken, remove);

export default router;
