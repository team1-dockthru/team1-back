import { Router } from "express";
import { checkDb } from "./health.controller.js";

const router = Router();

/**
 * @swagger
 * /health/db:
 *   get:
 *     tags: [Health]
 *     summary: 데이터베이스 연결 상태 확인
 *     description: 데이터베이스 연결 상태를 확인합니다.
 *     responses:
 *       200:
 *         description: 데이터베이스 연결 정상
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *             examples:
 *               success:
 *                 summary: 데이터베이스 연결 성공 예제
 *                 value:
 *                   ok: true
 *       500:
 *         description: 데이터베이스 연결 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               error:
 *                 summary: 데이터베이스 연결 실패 예제
 *                 value:
 *                   message: "데이터베이스 연결에 실패했습니다."
 */
router.get("/db", checkDb);

export default router;
