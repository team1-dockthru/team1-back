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
        url: process.env.API_URL || "http://localhost:4000",
        description: "API 서버",
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
    ],
  },
  apis: ["./src/modules/**/*.routes.js", "./src/modules/**/*.controller.js"],
};

const swaggerSpec = swaggerJsdoc(options);

export const swaggerSetup = (app) => {
  // Swagger JSON 스펙 엔드포인트 (동적 서버 URL 포함)
  app.get("/api-docs.json", (req, res) => {
    // 요청 호스트를 기반으로 서버 URL 동적 설정
    const protocol = req.protocol;
    const host = req.get("host");
    const baseUrl = `${protocol}://${host}`;
    
    // 서버 URL이 환경 변수로 설정되어 있지 않으면 요청 호스트 사용
    const serverUrl = process.env.API_URL || baseUrl;
    
    // 동적으로 서버 URL 업데이트
    const dynamicSpec = {
      ...swaggerSpec,
      servers: [
        {
          url: serverUrl,
          description: "API 서버",
        },
      ],
    };
    
    res.setHeader("Content-Type", "application/json");
    res.send(dynamicSpec);
  });

  // Swagger UI 설정 (동적 스펙 사용)
  const swaggerUiOptions = {
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "Team1 API Documentation",
    swaggerOptions: {
      persistAuthorization: true,
      url: "/api-docs.json", // 동적 스펙 엔드포인트 사용
    },
  };

  app.use("/api-docs", swaggerUi.serve);
  app.get("/api-docs", swaggerUi.setup(swaggerSpec, swaggerUiOptions));
};

export default swaggerSpec;
