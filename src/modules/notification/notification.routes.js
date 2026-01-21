import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import { list, read } from "./notification.controller.js";

const router = Router();

/**
 * @swagger
 * /notifications:
 *   get:
 *     tags: [Notification]
 *     summary: 알림 목록 조회
 *     description: 최신 알림부터 커서 기반으로 조회합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: cursor
 *         schema:
 *           type: string
 *         description: 다음 페이지 커서 (createdAt|id)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 페이지 크기 (기본값: 10, 최대 50)
 *         example: 10
 *       - in: query
 *         name: includeRead
 *         schema:
 *           type: boolean
 *         description: 읽은 알림 포함 여부 (기본값: false)
 *         example: false
 *     responses:
 *       200:
 *         description: 알림 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationListResponse'
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
router.get("/", authenticateToken, list);

/**
 * @swagger
 * /notifications/{id}/read:
 *   patch:
 *     tags: [Notification]
 *     summary: 알림 읽음 처리
 *     description: 알림을 읽음 상태로 변경합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 알림 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 읽음 처리 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/NotificationResponse'
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
 *         description: 읽음 처리 권한 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: 알림을 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/:id/read", authenticateToken, read);

export default router;
