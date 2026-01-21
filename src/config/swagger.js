import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Team1 Backend API",
      version: "1.0.0",
      description: "Team1 Dockthru 백엔드 API 문서",
      contact: {
        name: "API Support",
      },
    },
    servers: [
      {
        url: "http://localhost:4000/api",
        description: "로컬 개발 서버",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT 토큰을 입력하세요. 형식: Bearer {token}",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "사용자 ID",
              example: 1,
            },
            email: {
              type: "string",
              format: "email",
              description: "이메일 주소",
              example: "user@example.com",
            },
            nickname: {
              type: "string",
              description: "닉네임",
              example: "홍길동",
            },
            profileImage: {
              type: "string",
              enum: ["ADMIN", "USER"],
              description: "프로필 이미지 타입",
              example: "USER",
            },
            role: {
              type: "string",
              enum: ["ADMIN", "USER"],
              description: "사용자 역할",
              example: "USER",
            },
            grade: {
              type: "string",
              enum: ["EXPERT", "NORMAL"],
              description: "사용자 등급",
              example: "NORMAL",
            },
            challengeParticipations: {
              type: "integer",
              description: "챌린지 참여 횟수",
              example: 0,
            },
            recommendedCount: {
              type: "integer",
              description: "추천 받은 횟수",
              example: 0,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일시",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정일시",
            },
          },
        },
        SignupRequest: {
          type: "object",
          required: ["email", "password", "nickname"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "이메일 주소",
              example: "user@example.com",
            },
            password: {
              type: "string",
              minLength: 8,
              description: "비밀번호 (최소 8자)",
              example: "password123",
            },
            nickname: {
              type: "string",
              description: "닉네임",
              example: "홍길동",
            },
            profileImage: {
              type: "string",
              enum: ["ADMIN", "USER"],
              description: "프로필 이미지 타입 (선택사항, 기본값: USER)",
              example: "USER",
            },
          },
        },
        LoginRequest: {
          type: "object",
          required: ["email", "password"],
          properties: {
            email: {
              type: "string",
              format: "email",
              description: "이메일 주소",
              example: "user@example.com",
            },
            password: {
              type: "string",
              description: "비밀번호",
              example: "password123",
            },
          },
        },
        GoogleLoginRequest: {
          type: "object",
          required: ["idToken"],
          properties: {
            idToken: {
              type: "string",
              description: "Google ID 토큰",
              example: "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEyMzQ1NiJ9...",
            },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                user: {
                  $ref: "#/components/schemas/User",
                },
                token: {
                  type: "string",
                  description: "JWT 토큰",
                  example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                },
              },
            },
          },
        },
        UserResponse: {
          type: "object",
          properties: {
            data: {
              type: "object",
              properties: {
                user: {
                  $ref: "#/components/schemas/User",
                },
              },
            },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            message: {
              type: "string",
              description: "에러 메시지",
              example: "에러가 발생했습니다.",
            },
          },
        },
        Challenge: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "챌린지 ID",
              example: 1,
            },
            userId: {
              type: "integer",
              description: "생성자 사용자 ID",
              example: 1,
            },
            challengeRequestId: {
              type: "integer",
              nullable: true,
              description: "챌린지 요청 ID (선택사항)",
              example: 1,
            },
            title: {
              type: "string",
              description: "챌린지 제목",
              example: "React 공식 문서 번역 챌린지",
            },
            sourceUrl: {
              type: "string",
              description: "원본 문서 URL",
              example: "https://react.dev/learn",
            },
            field: {
              type: "string",
              description: "분야",
              example: "프론트엔드",
            },
            docType: {
              type: "string",
              enum: ["OFFICIAL_DOCUMENT", "BLOG"],
              description: "문서 타입",
              example: "OFFICIAL_DOCUMENT",
            },
            deadlineAt: {
              type: "string",
              format: "date-time",
              description: "마감일시",
              example: "2024-12-31T23:59:59.000Z",
            },
            maxParticipants: {
              type: "integer",
              description: "최대 참가자 수",
              example: 10,
            },
            content: {
              type: "string",
              description: "챌린지 설명",
              example: "React 공식 문서를 한국어로 번역하는 챌린지입니다.",
            },
            challengeStatus: {
              type: "string",
              enum: ["IN_PROGRESS", "CLOSED"],
              description: "챌린지 상태",
              example: "IN_PROGRESS",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일시",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정일시",
            },
            user: {
              type: "object",
              description: "생성자 정보",
              properties: {
                id: { type: "integer", example: 1 },
                nickname: { type: "string", example: "홍길동" },
                profileImage: { type: "string", enum: ["ADMIN", "USER"], example: "USER" },
              },
            },
            _count: {
              type: "object",
              description: "관련 데이터 개수",
              properties: {
                participants: { type: "integer", example: 5 },
                works: { type: "integer", example: 3 },
              },
            },
          },
        },
        CreateChallengeRequest: {
          type: "object",
          required: ["title", "sourceUrl", "field", "docType", "deadlineAt", "maxParticipants", "content"],
          properties: {
            title: {
              type: "string",
              description: "챌린지 제목",
              example: "React 공식 문서 번역 챌린지",
            },
            sourceUrl: {
              type: "string",
              description: "원본 문서 URL",
              example: "https://react.dev/learn",
            },
            field: {
              type: "string",
              description: "분야",
              example: "프론트엔드",
            },
            docType: {
              type: "string",
              enum: ["OFFICIAL_DOCUMENT", "BLOG"],
              description: "문서 타입",
              example: "OFFICIAL_DOCUMENT",
            },
            deadlineAt: {
              type: "string",
              format: "date-time",
              description: "마감일시 (ISO 8601 형식)",
              example: "2024-12-31T23:59:59.000Z",
            },
            maxParticipants: {
              type: "integer",
              minimum: 1,
              description: "최대 참가자 수",
              example: 10,
            },
            content: {
              type: "string",
              description: "챌린지 설명",
              example: "React 공식 문서를 한국어로 번역하는 챌린지입니다.",
            },
            challengeRequestId: {
              type: "integer",
              nullable: true,
              description: "챌린지 요청 ID (선택사항)",
              example: 1,
            },
          },
        },
        UpdateChallengeRequest: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "챌린지 제목",
              example: "수정된 챌린지 제목",
            },
            sourceUrl: {
              type: "string",
              description: "원본 문서 URL",
              example: "https://react.dev/learn",
            },
            field: {
              type: "string",
              description: "분야",
              example: "프론트엔드",
            },
            docType: {
              type: "string",
              enum: ["OFFICIAL_DOCUMENT", "BLOG"],
              description: "문서 타입",
              example: "OFFICIAL_DOCUMENT",
            },
            deadlineAt: {
              type: "string",
              format: "date-time",
              description: "마감일시 (ISO 8601 형식)",
              example: "2024-12-31T23:59:59.000Z",
            },
            maxParticipants: {
              type: "integer",
              minimum: 1,
              description: "최대 참가자 수",
              example: 20,
            },
            content: {
              type: "string",
              description: "챌린지 설명",
              example: "수정된 챌린지 설명입니다.",
            },
            challengeStatus: {
              type: "string",
              enum: ["IN_PROGRESS", "CLOSED"],
              description: "챌린지 상태",
              example: "CLOSED",
            },
          },
        },
        ChallengeResponse: {
          type: "object",
          properties: {
            data: {
              $ref: "#/components/schemas/Challenge",
            },
          },
        },
        ChallengeListResponse: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Challenge",
              },
            },
          },
        },
        Work: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "작업물 ID",
              example: 1,
            },
            userId: {
              type: "integer",
              description: "작성자 사용자 ID",
              example: 1,
            },
            challengeId: {
              type: "integer",
              description: "챌린지 ID",
              example: 1,
            },
            title: {
              type: "string",
              description: "작업물 제목",
              example: "React 문서 번역 작업물",
            },
            content: {
              type: "string",
              description: "작업물 내용",
              example: "챕터 1~3 번역 내용을 정리했습니다.",
            },
            originalUrl: {
              type: "string",
              nullable: true,
              description: "원본 작업물 URL",
              example: "https://example.com/work/1",
            },
            workStatus: {
              type: "string",
              enum: ["draft", "done"],
              description: "작업물 상태",
              example: "draft",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일시",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정일시",
            },
            submittedAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "제출일시",
            },
          },
        },
        CreateWorkRequest: {
          type: "object",
          required: ["challengeId", "title", "content"],
          properties: {
            challengeId: {
              type: "integer",
              description: "챌린지 ID",
              example: 1,
            },
            title: {
              type: "string",
              description: "작업물 제목",
              example: "React 문서 번역 작업물",
            },
            content: {
              type: "string",
              description: "작업물 내용",
              example: "챕터 1~3 번역 내용을 정리했습니다.",
            },
            originalUrl: {
              type: "string",
              nullable: true,
              description: "원본 작업물 URL",
              example: "https://example.com/work/1",
            },
          },
        },
        UpdateWorkRequest: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "작업물 제목",
              example: "수정된 작업물 제목",
            },
            content: {
              type: "string",
              description: "작업물 내용",
              example: "수정된 작업물 내용입니다.",
            },
            originalUrl: {
              type: "string",
              nullable: true,
              description: "원본 작업물 URL",
              example: "https://example.com/work/1",
            },
            workStatus: {
              type: "string",
              enum: ["draft", "done"],
              description: "작업물 상태",
              example: "done",
            },
          },
        },
        WorkResponse: {
          type: "object",
          properties: {
            data: {
              $ref: "#/components/schemas/Work",
            },
          },
        },
        WorkListResponse: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Work",
              },
            },
            page: {
              type: "integer",
              example: 1,
            },
            limit: {
              type: "integer",
              example: 5,
            },
            total: {
              type: "integer",
              example: 12,
            },
            totalPages: {
              type: "integer",
              example: 3,
            },
            hasNext: {
              type: "boolean",
              example: true,
            },
            hasPrev: {
              type: "boolean",
              example: false,
            },
          },
        },
        Feedback: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "피드백 ID",
              example: 1,
            },
            userId: {
              type: "integer",
              description: "작성자 사용자 ID",
              example: 1,
            },
            workId: {
              type: "integer",
              description: "작업물 ID",
              example: 1,
            },
            content: {
              type: "string",
              description: "피드백 내용",
              example: "잘 읽었습니다. 용어 통일만 조금 더 해주세요.",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일시",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "수정일시",
            },
          },
        },
        CreateFeedbackRequest: {
          type: "object",
          required: ["workId", "content"],
          properties: {
            workId: {
              type: "integer",
              description: "작업물 ID",
              example: 1,
            },
            content: {
              type: "string",
              description: "피드백 내용",
              example: "좋은 번역이네요. 마지막 문단만 다듬어 주세요.",
            },
          },
        },
        UpdateFeedbackRequest: {
          type: "object",
          required: ["content"],
          properties: {
            content: {
              type: "string",
              description: "피드백 내용",
              example: "수정된 피드백입니다.",
            },
          },
        },
        FeedbackResponse: {
          type: "object",
          properties: {
            data: {
              $ref: "#/components/schemas/Feedback",
            },
          },
        },
        FeedbackListResponse: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Feedback",
              },
            },
            page: {
              type: "integer",
              example: 1,
            },
            limit: {
              type: "integer",
              example: 3,
            },
            total: {
              type: "integer",
              example: 12,
            },
            totalPages: {
              type: "integer",
              example: 4,
            },
            hasNext: {
              type: "boolean",
              example: true,
            },
            hasPrev: {
              type: "boolean",
              example: false,
            },
          },
        },
        Like: {
          type: "object",
          properties: {
            userId: {
              type: "integer",
              description: "사용자 ID",
              example: 1,
            },
            workId: {
              type: "integer",
              description: "작업물 ID",
              example: 1,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일시",
            },
          },
        },
        LikeCount: {
          type: "object",
          properties: {
            count: {
              type: "integer",
              description: "좋아요 개수",
              example: 12,
            },
          },
        },
        LikeCountResponse: {
          type: "object",
          properties: {
            data: {
              $ref: "#/components/schemas/LikeCount",
            },
          },
        },
        Notification: {
          type: "object",
          properties: {
            id: {
              type: "integer",
              description: "알림 ID",
              example: 1,
            },
            type: {
              type: "string",
              description: "알림 타입",
              example: "WORK_CREATED",
            },
            message: {
              type: "string",
              description: "알림 메시지",
              example: "새 작업물이 등록되었습니다.",
            },
            challengeId: {
              type: "integer",
              nullable: true,
              description: "챌린지 ID",
              example: 1,
            },
            workId: {
              type: "integer",
              nullable: true,
              description: "작업물 ID",
              example: 10,
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "생성일시",
            },
            readAt: {
              type: "string",
              format: "date-time",
              nullable: true,
              description: "읽음 처리 시각",
            },
          },
        },
        NotificationResponse: {
          type: "object",
          properties: {
            data: {
              $ref: "#/components/schemas/Notification",
            },
          },
        },
        NotificationListResponse: {
          type: "object",
          properties: {
            data: {
              type: "array",
              items: {
                $ref: "#/components/schemas/Notification",
              },
            },
            nextCursor: {
              type: "string",
              nullable: true,
              example: "2024-04-01T12:00:00.000Z|42",
            },
            hasNext: {
              type: "boolean",
              example: true,
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Auth",
        description: "인증 관련 API",
      },
      {
        name: "User",
        description: "사용자 관련 API",
      },
      {
        name: "Health",
        description: "헬스 체크 API",
      },
      {
        name: "Challenge",
        description: "챌린지 관련 API",
      },
      {
        name: "Work",
        description: "작업물 관련 API",
      },
      {
        name: "Feedback",
        description: "피드백 관련 API",
      },
      {
        name: "Like",
        description: "좋아요 관련 API",
      },
      {
        name: "Notification",
        description: "알림 관련 API",
      },
    ],
  },
  apis: ["./src/modules/**/*.routes.js", "./src/modules/**/*.controller.js"],
};

const swaggerSpec = swaggerJsdoc(options);

const getServerUrl = (req) => {
  const xfProto = req.get("x-forwarded-proto");
  const protocol = xfProto ? xfProto.split(",")[0] : "https";
  const host = req.get("host");

  const baseUrl = process.env.API_URL || `${protocol}://${host}`;

  return `${baseUrl}`;
};

const createDynamicSpec = (req) => {
  const serverUrl = getServerUrl(req);
  const serverDescription = process.env.API_URL 
    ? "프로덕션 서버 (Render)" 
    : `로컬 개발 서버 (${serverUrl})`;
  
  return {
    ...swaggerSpec,
    servers: [
      {
        url: serverUrl,
        description: serverDescription,
      },
    ],
  };
};

export const swaggerSetup = (app) => {
  app.get("/api-docs.json", (req, res) => {
    const dynamicSpec = createDynamicSpec(req);
    res.setHeader("Content-Type", "application/json");
    res.send(dynamicSpec);
  });

  const swaggerUiOptions = {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Team1 API Documentation",
    swaggerOptions: {
      persistAuthorization: true,
      url: "/api-docs.json",
    },
  };

  app.use("/api-docs", swaggerUi.serve);
  app.get("/api-docs", (req, res, next) => {
    const dynamicSpec = createDynamicSpec(req);
    swaggerUi.setup(dynamicSpec, swaggerUiOptions)(req, res, next);
  });
};

export default swaggerSpec;
