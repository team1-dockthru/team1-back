import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { add, count, remove } from "./like.controller.js";

export const likeByWorkRouter = Router({ mergeParams: true });

/**
 * @swagger
 * /works/{workId}/likes/count:
 *   get:
 *     tags: [Like]
 *     summary: 좋아요 수 조회
 *     description: 작업물의 좋아요 수를 조회합니다.
 *     parameters:
 *       - in: path
 *         name: workId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 작업물 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 좋아요 수 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LikeCountResponse'
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
likeByWorkRouter.get("/count", count);

/**
 * @swagger
 * /works/{workId}/likes:
 *   post:
 *     tags: [Like]
 *     summary: 좋아요 추가
 *     description: 작업물 좋아요를 추가합니다. 인증이 필요합니다.
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
 *     responses:
 *       201:
 *         description: 좋아요 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LikeCountResponse'
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
 *       404:
 *         description: 작업물을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
likeByWorkRouter.post("/", authenticateToken, add);

/**
 * @swagger
 * /works/{workId}/likes:
 *   delete:
 *     tags: [Like]
 *     summary: 좋아요 취소
 *     description: 작업물 좋아요를 취소합니다. 인증이 필요합니다.
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
 *     responses:
 *       204:
 *         description: 좋아요 취소 성공
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
 *       404:
 *         description: 작업물을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
likeByWorkRouter.delete("/", authenticateToken, remove);

export default likeByWorkRouter;
