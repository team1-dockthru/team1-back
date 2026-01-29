import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.middleware.js";
import {
  create,
  getById,
  list,
  update,
  remove,
  adminDelete,
  adminReject,
  createParticipantRequest,
  getParticipants,
  updateParticipant,
  removeParticipant,
  createRequest,
  listRequests,
  getRequestById,
  updateRequest,
  removeRequest,
  processRequest,
  migrateRequests,
} from "./challenges.controller.js";

const router = Router();

/**
 * @swagger
 * /challenges:
 *   get:
 *     tags: [Challenge]
 *     summary: 챌린지 목록 조회
 *     description: 챌린지 목록을 조회합니다. 필터링 옵션과 페이지네이션을 사용할 수 있습니다. 마감일이 지난 진행중 챌린지는 자동으로 완료 상태로 변경됩니다.
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: 특정 사용자의 챌린지만 조회
 *         example: 1
 *       - in: query
 *         name: challengeStatus
 *         schema:
 *           type: string
 *           enum: [IN_PROGRESS, COMPLETED, CLOSED]
 *         description: 챌린지 상태로 필터링 (IN_PROGRESS=진행중, COMPLETED=완료, CLOSED=관리자 마감)
 *         example: IN_PROGRESS
 *       - in: query
 *         name: field
 *         schema:
 *           type: string
 *         description: 분야로 필터링
 *         example: 프론트엔드
 *       - in: query
 *         name: docType
 *         schema:
 *           type: string
 *           enum: [OFFICIAL_DOCUMENT, BLOG]
 *         description: 문서 타입으로 필터링
 *         example: OFFICIAL_DOCUMENT
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: 페이지 번호 (1부터 시작)
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: 페이지당 항목 수 (최대 100)
 *         example: 10
 *     responses:
 *       200:
 *         description: 챌린지 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Challenge'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     currentPage:
 *                       type: integer
 *                       example: 1
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *                     totalCount:
 *                       type: integer
 *                       example: 50
 *                     limit:
 *                       type: integer
 *                       example: 10
 *             examples:
 *               success:
 *                 summary: 챌린지 목록 조회 성공 예제
 *                 value:
 *                   data:
 *                     - id: 1
 *                       userId: 1
 *                       challengeRequestId: null
 *                       title: "React 공식 문서 번역 챌린지"
 *                       sourceUrl: "https://react.dev/learn"
 *                       field: "프론트엔드"
 *                       docType: "OFFICIAL_DOCUMENT"
 *                       deadlineAt: "2024-12-31T23:59:59.000Z"
 *                       maxParticipants: 10
 *                       content: "React 공식 문서를 한국어로 번역하는 챌린지입니다."
 *                       challengeStatus: "IN_PROGRESS"
 *                       createdAt: "2024-01-01T00:00:00.000Z"
 *                       updatedAt: "2024-01-01T00:00:00.000Z"
 *                       user:
 *                         id: 1
 *                         nickname: "홍길동"
 *                         profileImage: "USER"
 *                       _count:
 *                         participants: 5
 *                         works: 3
 *                   pagination:
 *                     currentPage: 1
 *                     totalPages: 5
 *                     totalCount: 50
 *                     limit: 10
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
 * /challenges/requests:
 *   get:
 *     tags: [Challenge]
 *     summary: 챌린지 생성 신청 목록 조회
 *     description: 챌린지 생성 신청 목록을 조회합니다. 필터링 옵션을 사용할 수 있습니다.
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: integer
 *         description: 특정 사용자의 신청만 조회
 *         example: 1
 *       - in: query
 *         name: requestStatus
 *         schema:
 *           type: string
 *           enum: [PENDING, REJECTED, CANCELLED]
 *         description: 신청 상태로 필터링
 *         example: PENDING
 *     responses:
 *       200:
 *         description: 챌린지 생성 신청 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChallengeRequestListResponse'
 *             examples:
 *               success:
 *                 summary: 챌린지 생성 신청 목록 조회 응답 예시
 *                 value:
 *                   data:
 *                     - id: 1
 *                       userId: 1
 *                       title: "React 공식 문서 번역 챌린지"
 *                       sourceUrl: "https://react.dev/learn"
 *                       field: "프론트엔드"
 *                       docType: "OFFICIAL_DOCUMENT"
 *                       deadlineAt: "2024-12-31T23:59:59.000Z"
 *                       maxParticipants: 10
 *                       content: "React 공식 문서를 한국어로 번역하는 챌린지입니다."
 *                       requestStatus: "PENDING"
 *                       adminReason: null
 *                       processedAt: null
 *                       createdAt: "2024-01-15T00:00:00.000Z"
 *                       updatedAt: "2024-01-15T00:00:00.000Z"
 *                       challenges: []
 *                       _count: { challenges: 0 }
 *                       user: { id: 1, nickname: "홍길동", profileImage: "USER" }
 *                     - id: 2
 *                       userId: 1
 *                       title: "Next.js 블로그 번역 챌린지"
 *                       sourceUrl: "https://nextjs.org/blog"
 *                       field: "프론트엔드"
 *                       docType: "BLOG"
 *                       maxParticipants: 20
 *                       deadlineAt: "2024-12-31T23:59:59.000Z"
 *                       content: "Next.js 공식 블로그 포스트를 번역하는 챌린지입니다."
 *                       requestStatus: "PENDING"
 *                       adminReason: null
 *                       processedAt: null
 *                       createdAt: "2024-01-10T00:00:00.000Z"
 *                       updatedAt: "2024-01-10T00:00:00.000Z"
 *                       challenges: [{ id: 5 }]
 *                       _count: { challenges: 1 }
 *                       user: { id: 1, nickname: "홍길동", profileImage: "USER" }
 *       400:
 *         description: 잘못된 요청
 */
router.get("/requests", listRequests);

/**
 * @swagger
 * /challenges/{id}:
 *   get:
 *     tags: [Challenge]
 *     summary: 챌린지 상세 조회
 *     description: 특정 챌린지의 상세 정보를 조회합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 챌린지 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 챌린지 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChallengeResponse'
 *             examples:
 *               success:
 *                 summary: 챌린지 상세 조회 성공 예제
 *                 value:
 *                   data:
 *                     id: 1
 *                     userId: 1
 *                     challengeRequestId: null
 *                     title: "React 공식 문서 번역 챌린지"
 *                     sourceUrl: "https://react.dev/learn"
 *                     field: "프론트엔드"
 *                     docType: "OFFICIAL_DOCUMENT"
 *                     deadlineAt: "2024-12-31T23:59:59.000Z"
 *                     maxParticipants: 10
 *                     content: "React 공식 문서를 한국어로 번역하는 챌린지입니다."
 *                     challengeStatus: "IN_PROGRESS"
 *                     createdAt: "2024-01-01T00:00:00.000Z"
 *                     updatedAt: "2024-01-01T00:00:00.000Z"
 *                     user:
 *                       id: 1
 *                       nickname: "홍길동"
 *                       profileImage: "USER"
 *                     challengeRequest:
 *                       id: 1
 *                       title: "챌린지 요청 제목"
 *                     _count:
 *                       participants: 5
 *                       works: 3
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               badRequest:
 *                 summary: 잘못된 ID 예제
 *                 value:
 *                   message: "유효한 challenge id가 필요합니다."
 *       404:
 *         description: 챌린지를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFound:
 *                 summary: 챌린지 없음 예제
 *                 value:
 *                   message: "챌린지를 찾을 수 없습니다."
 */
router.get("/:id", getById);

/**
 * @swagger
 * /challenges:
 *   post:
 *     tags: [Challenge]
 *     summary: 챌린지 생성
 *     description: 새로운 챌린지를 생성합니다. 인증이 필요합니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateChallengeRequest'
 *           examples:
 *             example1:
 *               summary: 공식 문서 챌린지 생성
 *               value:
 *                 title: "React 공식 문서 번역 챌린지"
 *                 sourceUrl: "https://react.dev/learn"
 *                 field: "프론트엔드"
 *                 docType: "OFFICIAL_DOCUMENT"
 *                 deadlineAt: "2024-12-31T23:59:59.000Z"
 *                 maxParticipants: 10
 *                 content: "React 공식 문서를 한국어로 번역하는 챌린지입니다."
 *             example2:
 *               summary: 블로그 챌린지 생성
 *               value:
 *                 title: "Next.js 블로그 포스트 번역 챌린지"
 *                 sourceUrl: "https://nextjs.org/blog"
 *                 field: "프론트엔드"
 *                 docType: "BLOG"
 *                 deadlineAt: "2024-12-31T23:59:59.000Z"
 *                 maxParticipants: 20
 *                 content: "Next.js 공식 블로그 포스트를 번역하는 챌린지입니다."
 *                 challengeRequestId: 1
 *     responses:
 *       201:
 *         description: 챌린지 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChallengeResponse'
 *             examples:
 *               success:
 *                 summary: 챌린지 생성 성공 예제
 *                 value:
 *                   data:
 *                     id: 1
 *                     userId: 1
 *                     challengeRequestId: null
 *                     title: "React 공식 문서 번역 챌린지"
 *                     sourceUrl: "https://react.dev/learn"
 *                     field: "프론트엔드"
 *                     docType: "OFFICIAL_DOCUMENT"
 *                     deadlineAt: "2024-12-31T23:59:59.000Z"
 *                     maxParticipants: 10
 *                     content: "React 공식 문서를 한국어로 번역하는 챌린지입니다."
 *                     challengeStatus: "IN_PROGRESS"
 *                     createdAt: "2024-01-01T00:00:00.000Z"
 *                     updatedAt: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               badRequest:
 *                 summary: 필수 필드 누락 예제
 *                 value:
 *                   message: "title은 필수입니다."
 *       401:
 *         description: 인증 실패
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               unauthorized:
 *                 summary: 인증 토큰 없음 예제
 *                 value:
 *                   message: "인증 토큰이 필요합니다."
 */
router.post("/", authenticateToken, create);

/**
 * @swagger
 * /challenges/{id}:
 *   patch:
 *     tags: [Challenge]
 *     summary: 챌린지 수정
 *     description: 챌린지 정보를 수정합니다. 본인이 생성한 챌린지만 수정 가능합니다. 인증이 필요합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 챌린지 ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateChallengeRequest'
 *           examples:
 *             example1:
 *               summary: 제목과 참가자 수 수정
 *               value:
 *                 title: "수정된 챌린지 제목"
 *                 maxParticipants: 20
 *             example2:
 *               summary: 상태 변경
 *               value:
 *                 challengeStatus: "CLOSED"
 *     responses:
 *       200:
 *         description: 챌린지 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChallengeResponse'
 *             examples:
 *               success:
 *                 summary: 챌린지 수정 성공 예제
 *                 value:
 *                   data:
 *                     id: 1
 *                     userId: 1
 *                     title: "수정된 챌린지 제목"
 *                     maxParticipants: 20
 *                     challengeStatus: "IN_PROGRESS"
 *                     updatedAt: "2024-01-02T00:00:00.000Z"
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               badRequest:
 *                 summary: 수정할 값 없음 예제
 *                 value:
 *                   message: "수정할 값이 없습니다."
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
 *             examples:
 *               forbidden:
 *                 summary: 권한 없음 예제
 *                 value:
 *                   message: "수정 권한이 없습니다."
 *       404:
 *         description: 챌린지를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/:id", authenticateToken, update);

/**
 * @swagger
 * /challenges/{id}:
 *   delete:
 *     tags: [Challenge]
 *     summary: 챌린지 삭제
 *     description: 챌린지를 삭제합니다. 본인이 생성한 챌린지만 삭제 가능합니다. 인증이 필요합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 챌린지 ID
 *         example: 1
 *     responses:
 *       204:
 *         description: 챌린지 삭제 성공
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               badRequest:
 *                 summary: 잘못된 ID 예제
 *                 value:
 *                   message: "유효한 challenge id가 필요합니다."
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
 *             examples:
 *               forbidden:
 *                 summary: 권한 없음 예제
 *                 value:
 *                   message: "삭제 권한이 없습니다."
 *       404:
 *         description: 챌린지를 찾을 수 없음
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               notFound:
 *                 summary: 챌린지 없음 예제
 *                 value:
 *                   message: "챌린지를 찾을 수 없습니다."
 */
router.delete("/:id", authenticateToken, remove);

/**
 * @swagger
 * /challenges/{id}/admin/delete:
 *   delete:
 *     tags: [Challenge]
 *     summary: 챌린지 관리자 삭제
 *     description: 관리자가 챌린지를 삭제합니다. 삭제 사유를 필수로 입력해야 합니다. 인증이 필요합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 챌린지 ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adminReason
 *             properties:
 *               adminReason:
 *                 type: string
 *                 description: 삭제 사유
 *                 example: "부적절한 내용이 포함되어 있습니다."
 *     responses:
 *       204:
 *         description: 챌린지 삭제 성공
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingReason:
 *                 summary: 삭제 사유 없음
 *                 value:
 *                   message: "삭제 사유는 필수입니다."
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 삭제 권한 없음 (관리자만 가능)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               forbidden:
 *                 summary: 권한 없음 예제
 *                 value:
 *                   message: "챌린지 삭제 권한이 없습니다."
 *       404:
 *         description: 챌린지를 찾을 수 없음
 */
router.delete("/:id/admin/delete", authenticateToken, adminDelete);

/**
 * @swagger
 * /challenges/{id}/admin/reject:
 *   patch:
 *     tags: [Challenge]
 *     summary: 챌린지 관리자 거절
 *     description: 관리자가 챌린지를 거절합니다. 챌린지 상태를 CLOSED로 변경하고 거절 사유를 저장합니다. 인증이 필요합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 챌린지 ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - adminReason
 *             properties:
 *               adminReason:
 *                 type: string
 *                 description: 거절 사유
 *                 example: "부적절한 내용이 포함되어 있습니다."
 *     responses:
 *       200:
 *         description: 챌린지 거절 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChallengeResponse'
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               missingReason:
 *                 summary: 거절 사유 없음
 *                 value:
 *                   message: "거절 사유는 필수입니다."
 *               alreadyClosed:
 *                 summary: 이미 마감됨
 *                 value:
 *                   message: "이미 마감된 챌린지는 거절할 수 없습니다."
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 거절 권한 없음 (관리자만 가능)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               forbidden:
 *                 summary: 권한 없음 예제
 *                 value:
 *                   message: "챌린지 거절 권한이 없습니다."
 *       404:
 *         description: 챌린지를 찾을 수 없음
 */
router.patch("/:id/admin/reject", authenticateToken, adminReject);

/**
 * @swagger
 * /challenges/{id}/participants:
 *   post:
 *     tags: [Challenge]
 *     summary: 챌린지 참여 신청
 *     description: 챌린지에 참여 신청합니다. 인증이 필요합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 챌린지 ID
 *         example: 1
 *     responses:
 *       201:
 *         description: 참여 신청 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     userId:
 *                       type: integer
 *                       example: 2
 *                     challengeId:
 *                       type: integer
 *                       example: 1
 *                     participantStatus:
 *                       type: string
 *                       enum: [PENDING, REJECTED, APPROVED, CHALLENGE_DELETED]
 *                       example: PENDING
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                         nickname:
 *                           type: string
 *                         profileImage:
 *                           type: string
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               alreadyParticipated:
 *                 summary: 이미 참여 신청함
 *                 value:
 *                   message: "이미 참여 신청한 챌린지입니다."
 *               maxParticipants:
 *                 summary: 최대 인원 도달
 *                 value:
 *                   message: "최대 참여 인원에 도달했습니다."
 *               closed:
 *                 summary: 마감된 챌린지
 *                 value:
 *                   message: "마감된 챌린지에는 참여할 수 없습니다."
 *       401:
 *         description: 인증 실패
 *       404:
 *         description: 챌린지를 찾을 수 없음
 */
router.post("/:id/participants", authenticateToken, createParticipantRequest);

/**
 * @swagger
 * /challenges/{id}/participants:
 *   get:
 *     tags: [Challenge]
 *     summary: 챌린지 참여자 목록 조회
 *     description: 챌린지 참여 신청자 목록을 조회합니다. 챌린지 생성자 또는 관리자만 조회 가능합니다. 인증이 필요합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 챌린지 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 참여자 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       userId:
 *                         type: integer
 *                       challengeId:
 *                         type: integer
 *                       participantStatus:
 *                         type: string
 *                         enum: [PENDING, REJECTED, APPROVED, CHALLENGE_DELETED]
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       user:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: integer
 *                           nickname:
 *                             type: string
 *                           profileImage:
 *                             type: string
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 조회 권한 없음
 *       404:
 *         description: 챌린지를 찾을 수 없음
 */
router.get("/:id/participants", authenticateToken, getParticipants);

/**
 * @swagger
 * /challenges/{id}/participants/{participantId}:
 *   patch:
 *     tags: [Challenge]
 *     summary: 참여 신청 상태 변경
 *     description: 참여 신청의 상태를 변경합니다(승인/거절). 챌린지 생성자 또는 관리자만 가능합니다. 인증이 필요합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 챌린지 ID
 *         example: 1
 *       - in: path
 *         name: participantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 참여 신청 ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [PENDING, REJECTED, APPROVED, CHALLENGE_DELETED]
 *                 description: 변경할 참여 상태
 *                 example: APPROVED
 *           examples:
 *             approve:
 *               summary: 참여 승인
 *               value:
 *                 status: APPROVED
 *             reject:
 *               summary: 참여 거절
 *               value:
 *                 status: REJECTED
 *     responses:
 *       200:
 *         description: 상태 변경 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     userId:
 *                       type: integer
 *                     challengeId:
 *                       type: integer
 *                     participantStatus:
 *                       type: string
 *                       enum: [PENDING, REJECTED, APPROVED, CHALLENGE_DELETED]
 *                     user:
 *                       type: object
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               invalidStatus:
 *                 summary: 유효하지 않은 상태
 *                 value:
 *                   message: "status는 필수이며 PENDING, REJECTED, APPROVED, CHALLENGE_DELETED 중 하나여야 합니다."
 *               maxParticipants:
 *                 summary: 최대 인원 도달
 *                 value:
 *                   message: "최대 참여 인원에 도달했습니다."
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 상태 변경 권한 없음
 *       404:
 *         description: 참여 신청을 찾을 수 없음
 */
router.patch("/:id/participants/:participantId", authenticateToken, updateParticipant);

/**
 * @swagger
 * /challenges/{id}/participants/{participantId}:
 *   delete:
 *     tags: [Challenge]
 *     summary: 참여 신청 취소
 *     description: 본인의 참여 신청을 취소합니다. 이미 승인된 경우 취소할 수 없습니다. 인증이 필요합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 챌린지 ID
 *         example: 1
 *       - in: path
 *         name: participantId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 참여 신청 ID
 *         example: 1
 *     responses:
 *       204:
 *         description: 참여 신청 취소 성공
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               alreadyApproved:
 *                 summary: 이미 승인됨
 *                 value:
 *                   message: "이미 승인된 참여 신청은 취소할 수 없습니다."
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 취소 권한 없음
 *       404:
 *         description: 참여 신청을 찾을 수 없음
 */
router.delete("/:id/participants/:participantId", authenticateToken, removeParticipant);

/**
 * @swagger
 * /challenges/requests:
 *   post:
 *     tags: [Challenge]
 *     summary: 챌린지 생성 신청
 *     description: 챌린지 생성을 신청합니다. 인증이 필요합니다.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - sourceUrl
 *               - field
 *               - docType
 *               - deadlineAt
 *               - maxParticipants
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 description: 챌린지 제목
 *                 example: "React 공식 문서 번역 챌린지"
 *               sourceUrl:
 *                 type: string
 *                 description: 원문 URL
 *                 example: "https://react.dev/learn"
 *               field:
 *                 type: string
 *                 description: 분야
 *                 example: "프론트엔드"
 *               docType:
 *                 type: string
 *                 enum: [OFFICIAL_DOCUMENT, BLOG]
 *                 description: 문서 타입
 *                 example: "OFFICIAL_DOCUMENT"
 *               deadlineAt:
 *                 type: string
 *                 format: date-time
 *                 description: 마감일자
 *                 example: "2024-12-31T23:59:59.000Z"
 *               maxParticipants:
 *                 type: integer
 *                 description: 최대 참여 인원
 *                 example: 10
 *               content:
 *                 type: string
 *                 description: 본문
 *                 example: "React 공식 문서를 한국어로 번역하는 챌린지입니다."
 *     responses:
 *       201:
 *         description: 챌린지 생성 신청 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     userId:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     sourceUrl:
 *                       type: string
 *                     field:
 *                       type: string
 *                     docType:
 *                       type: string
 *                     deadlineAt:
 *                       type: string
 *                       format: date-time
 *                     maxParticipants:
 *                       type: integer
 *                     content:
 *                       type: string
 *                     requestStatus:
 *                       type: string
 *                       enum: [PENDING, REJECTED, CANCELLED]
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                     user:
 *                       type: object
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 */
router.post("/requests", authenticateToken, createRequest);

/**
 * @swagger
 * /challenges/requests/{id}:
 *   get:
 *     tags: [Challenge]
 *     summary: 챌린지 생성 신청 상세 조회
 *     description: 특정 챌린지 생성 신청의 상세 정보를 조회합니다.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 챌린지 생성 신청 ID
 *         example: 1
 *     responses:
 *       200:
 *         description: 챌린지 생성 신청 상세 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChallengeRequestResponse'
 *       400:
 *         description: 잘못된 요청
 *       404:
 *         description: 챌린지 생성 신청을 찾을 수 없음
 */
router.get("/requests/:id", getRequestById);

/**
 * @swagger
 * /challenges/requests/{id}:
 *   patch:
 *     tags: [Challenge]
 *     summary: 챌린지 생성 신청 수정
 *     description: 챌린지 생성 신청 정보를 수정합니다. 본인이 신청한 것만 수정 가능하며, 신청중 상태일 때만 수정 가능합니다. 인증이 필요합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 챌린지 생성 신청 ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               sourceUrl:
 *                 type: string
 *               field:
 *                 type: string
 *               docType:
 *                 type: string
 *                 enum: [OFFICIAL_DOCUMENT, BLOG]
 *               deadlineAt:
 *                 type: string
 *                 format: date-time
 *               maxParticipants:
 *                 type: integer
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: 챌린지 생성 신청 수정 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 수정 권한 없음
 *       404:
 *         description: 챌린지 생성 신청을 찾을 수 없음
 */
router.patch("/requests/:id", authenticateToken, updateRequest);

/**
 * @swagger
 * /challenges/requests/{id}:
 *   delete:
 *     tags: [Challenge]
 *     summary: 챌린지 생성 신청 취소
 *     description: 챌린지 생성 신청을 취소합니다. 본인이 신청한 것만 취소 가능하며, 신청중 상태일 때만 취소 가능합니다. 인증이 필요합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 챌린지 생성 신청 ID
 *         example: 1
 *     responses:
 *       204:
 *         description: 챌린지 생성 신청 취소 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 취소 권한 없음
 *       404:
 *         description: 챌린지 생성 신청을 찾을 수 없음
 */
router.delete("/requests/:id", authenticateToken, removeRequest);

/**
 * @swagger
 * /challenges/requests/{id}/process:
 *   patch:
 *     tags: [Challenge]
 *     summary: 챌린지 생성 신청 승인/거절
 *     description: 챌린지 생성 신청을 승인하거나 거절합니다. 관리자만 가능하며, 신청중 상태일 때만 처리 가능합니다. 인증이 필요합니다.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: 챌린지 생성 신청 ID
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [REJECTED]
 *                 description: 변경할 신청 상태 (승인은 별도 엔드포인트에서 챌린지 생성으로 처리)
 *                 example: REJECTED
 *               adminReason:
 *                 type: string
 *                 description: 거절 사유 (거절 시 필수)
 *                 example: "내용이 부적절합니다."
 *     responses:
 *       200:
 *         description: 챌린지 생성 신청 처리 성공
 *       400:
 *         description: 잘못된 요청
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 처리 권한 없음
 *       404:
 *         description: 챌린지 생성 신청을 찾을 수 없음
 */
router.patch("/requests/:id/process", authenticateToken, processRequest);

/**
 * @swagger
 * /challenges/migrate:
 *   post:
 *     tags: [Challenge]
 *     summary: 승인된 챌린지 신청 마이그레이션
 *     description: 승인된 ChallengeRequest 중 Challenge가 없는 것들에 대해 Challenge를 자동 생성합니다. 관리자만 실행 가능합니다.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 마이그레이션 성공
 *       401:
 *         description: 인증 실패
 *       403:
 *         description: 관리자 권한 필요
 */
router.post("/migrate", authenticateToken, migrateRequests);

export default router;
