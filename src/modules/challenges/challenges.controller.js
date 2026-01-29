import {
  createChallenge,
  getChallengeById,
  listChallenges,
  listMyChallenges,
  updateChallenge,
  deleteChallenge,
  adminDeleteChallenge,
  adminRejectChallenge,
  createParticipant,
  listParticipants,
  updateParticipantStatus,
  deleteParticipant,
  createChallengeRequest,
  listChallengeRequests,
  getChallengeRequestById,
  updateChallengeRequest,
  deleteChallengeRequest,
  processChallengeRequest,
  migrateApprovedRequests,
  ChallengeStatus,
  DocType,
  ParticipantStatus,
  RequestStatus,
} from "./challenges.service.js";

const parseIntStrict = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

export async function create(req, res, next) {
  try {
    const {
      challengeRequestId,
      title,
      sourceUrl,
      field,
      docType,
      deadlineAt,
      maxParticipants,
      content,
    } = req.body || {};

    if (!title || typeof title !== "string") {
      return res.status(400).json({ message: "title은 필수입니다." });
    }
    if (!sourceUrl || typeof sourceUrl !== "string") {
      return res.status(400).json({ message: "sourceUrl은 필수입니다." });
    }
    if (!field || typeof field !== "string") {
      return res.status(400).json({ message: "field는 필수입니다." });
    }
    if (!docType || !Object.values(DocType).includes(docType)) {
      return res.status(400).json({ message: "docType은 필수이며 OFFICIAL_DOCUMENT 또는 BLOG여야 합니다." });
    }
    if (!deadlineAt) {
      return res.status(400).json({ message: "deadlineAt은 필수입니다." });
    }
    if (!maxParticipants || typeof maxParticipants !== "number" || maxParticipants < 1) {
      return res.status(400).json({ message: "maxParticipants는 1 이상의 숫자여야 합니다." });
    }
    if (!content || typeof content !== "string") {
      return res.status(400).json({ message: "content는 필수입니다." });
    }

    const parsedChallengeRequestId = parseIntStrict(challengeRequestId);

    const challenge = await createChallenge({
      userId: req.user.userId,
      challengeRequestId: parsedChallengeRequestId ?? undefined,
      title,
      sourceUrl,
      field,
      docType,
      deadlineAt,
      maxParticipants,
      content,
    });

    return res.status(201).json({ data: challenge });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { userId, challengeStatus, field, docType, page, limit } = req.query || {};

    const parsedUserId = parseIntStrict(userId);
    const parsedPage = parseIntStrict(page) || 1;
    const parsedLimit = parseIntStrict(limit) || 10;

    // 페이지네이션 유효성 검사
    if (parsedPage < 1) {
      return res.status(400).json({ message: "page는 1 이상이어야 합니다." });
    }
    if (parsedLimit < 1 || parsedLimit > 100) {
      return res.status(400).json({ message: "limit는 1 이상 100 이하여야 합니다." });
    }

    if (challengeStatus && !Object.values(ChallengeStatus).includes(challengeStatus)) {
      return res.status(400).json({ message: "challengeStatus 값이 올바르지 않습니다." });
    }
    if (docType && !Object.values(DocType).includes(docType)) {
      return res.status(400).json({ message: "docType 값이 올바르지 않습니다." });
    }

    const result = await listChallenges({
      userId: parsedUserId ?? undefined,
      challengeStatus: challengeStatus || undefined,
      field: field || undefined,
      docType: docType || undefined,
      page: parsedPage,
      limit: parsedLimit,
    });

    return res.status(200).json({
      data: result.challenges,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

// 나의 챌린지 조회 (내가 생성했거나 참여 중인 챌린지)
export async function listMy(req, res, next) {
  try {
    const { challengeStatus, page, limit } = req.query || {};

    const parsedPage = parseIntStrict(page) || 1;
    const parsedLimit = parseIntStrict(limit) || 10;

    // 페이지네이션 유효성 검사
    if (parsedPage < 1) {
      return res.status(400).json({ message: "page는 1 이상이어야 합니다." });
    }
    if (parsedLimit < 1 || parsedLimit > 100) {
      return res.status(400).json({ message: "limit는 1 이상 100 이하여야 합니다." });
    }

    if (challengeStatus && !Object.values(ChallengeStatus).includes(challengeStatus)) {
      return res.status(400).json({ message: "challengeStatus 값이 올바르지 않습니다." });
    }

    const result = await listMyChallenges({
      userId: req.user.userId,
      challengeStatus: challengeStatus || undefined,
      page: parsedPage,
      limit: parsedLimit,
    });

    return res.status(200).json({
      data: result.challenges,
      pagination: result.pagination,
    });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const id = parseIntStrict(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "유효한 challenge id가 필요합니다." });
    }

    const challenge = await getChallengeById(id);
    if (!challenge) {
      return res.status(404).json({ message: "챌린지를 찾을 수 없습니다." });
    }

    return res.status(200).json({ data: challenge });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const id = parseIntStrict(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "유효한 challenge id가 필요합니다." });
    }

    const {
      title,
      sourceUrl,
      field,
      docType,
      deadlineAt,
      maxParticipants,
      content,
      challengeStatus,
    } = req.body || {};

    if (challengeStatus && !Object.values(ChallengeStatus).includes(challengeStatus)) {
      return res.status(400).json({ message: "challengeStatus 값이 올바르지 않습니다." });
    }
    if (docType && !Object.values(DocType).includes(docType)) {
      return res.status(400).json({ message: "docType 값이 올바르지 않습니다." });
    }
    if (maxParticipants !== undefined && (typeof maxParticipants !== "number" || maxParticipants < 1)) {
      return res.status(400).json({ message: "maxParticipants는 1 이상의 숫자여야 합니다." });
    }

    const data = {};
    if (title !== undefined) data.title = title;
    if (sourceUrl !== undefined) data.sourceUrl = sourceUrl;
    if (field !== undefined) data.field = field;
    if (docType !== undefined) data.docType = docType;
    if (deadlineAt !== undefined) data.deadlineAt = deadlineAt;
    if (maxParticipants !== undefined) data.maxParticipants = maxParticipants;
    if (content !== undefined) data.content = content;
    if (challengeStatus !== undefined) data.challengeStatus = challengeStatus;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "수정할 값이 없습니다." });
    }

    const challenge = await updateChallenge({
      id,
      userId: req.user.userId,
      data,
    });

    return res.status(200).json({ data: challenge });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const id = parseIntStrict(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "유효한 challenge id가 필요합니다." });
    }

    await deleteChallenge({ id, userId: req.user.userId });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function adminDelete(req, res, next) {
  try {
    const id = parseIntStrict(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "유효한 challenge id가 필요합니다." });
    }

    const { adminReason } = req.body || {};

    if (!adminReason || typeof adminReason !== "string" || adminReason.trim() === "") {
      return res.status(400).json({ message: "삭제 사유는 필수입니다." });
    }

    await adminDeleteChallenge({
      id,
      userId: req.user.userId,
      role: req.user.role,
      adminReason,
    });

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function adminReject(req, res, next) {
  try {
    const id = parseIntStrict(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "유효한 challenge id가 필요합니다." });
    }

    const { adminReason } = req.body || {};

    if (!adminReason || typeof adminReason !== "string" || adminReason.trim() === "") {
      return res.status(400).json({ message: "거절 사유는 필수입니다." });
    }

    const challenge = await adminRejectChallenge({
      id,
      userId: req.user.userId,
      role: req.user.role,
      adminReason,
    });

    return res.status(200).json({ data: challenge });
  } catch (err) {
    next(err);
  }
}

export async function createParticipantRequest(req, res, next) {
  try {
    const challengeId = parseIntStrict(req.params.id);
    if (!challengeId) {
      return res.status(400).json({ message: "유효한 challenge id가 필요합니다." });
    }

    const participant = await createParticipant({
      challengeId,
      userId: req.user.userId,
    });

    return res.status(201).json({ data: participant });
  } catch (err) {
    next(err);
  }
}

export async function getParticipants(req, res, next) {
  try {
    const challengeId = parseIntStrict(req.params.id);
    if (!challengeId) {
      return res.status(400).json({ message: "유효한 challenge id가 필요합니다." });
    }

    const participants = await listParticipants({
      challengeId,
      userId: req.user.userId,
      role: req.user.role,
    });

    return res.status(200).json({ data: participants });
  } catch (err) {
    next(err);
  }
}

export async function updateParticipant(req, res, next) {
  try {
    const challengeId = parseIntStrict(req.params.id);
    const participantId = parseIntStrict(req.params.participantId);

    if (!challengeId) {
      return res.status(400).json({ message: "유효한 challenge id가 필요합니다." });
    }
    if (!participantId) {
      return res.status(400).json({ message: "유효한 participant id가 필요합니다." });
    }

    const { status } = req.body || {};

    if (!status || !Object.values(ParticipantStatus).includes(status)) {
      return res.status(400).json({
        message: "status는 필수이며 PENDING, REJECTED, APPROVED, CHALLENGE_DELETED 중 하나여야 합니다.",
      });
    }

    const participant = await updateParticipantStatus({
      challengeId,
      participantId,
      userId: req.user.userId,
      role: req.user.role,
      status,
    });

    return res.status(200).json({ data: participant });
  } catch (err) {
    next(err);
  }
}

export async function removeParticipant(req, res, next) {
  try {
    const challengeId = parseIntStrict(req.params.id);
    const participantId = parseIntStrict(req.params.participantId);

    if (!challengeId) {
      return res.status(400).json({ message: "유효한 challenge id가 필요합니다." });
    }
    if (!participantId) {
      return res.status(400).json({ message: "유효한 participant id가 필요합니다." });
    }

    await deleteParticipant({
      challengeId,
      participantId,
      userId: req.user.userId,
    });

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function createRequest(req, res, next) {
  try {
    const {
      title,
      sourceUrl,
      field,
      docType,
      deadlineAt,
      maxParticipants,
      content,
    } = req.body || {};

    if (!title || typeof title !== "string") {
      return res.status(400).json({ message: "title은 필수입니다." });
    }
    if (!sourceUrl || typeof sourceUrl !== "string") {
      return res.status(400).json({ message: "sourceUrl은 필수입니다." });
    }
    if (!field || typeof field !== "string") {
      return res.status(400).json({ message: "field는 필수입니다." });
    }
    if (!docType || !Object.values(DocType).includes(docType)) {
      return res.status(400).json({ message: "docType은 필수이며 OFFICIAL_DOCUMENT 또는 BLOG여야 합니다." });
    }
    if (!deadlineAt) {
      return res.status(400).json({ message: "deadlineAt은 필수입니다." });
    }
    if (!maxParticipants || typeof maxParticipants !== "number" || maxParticipants < 1) {
      return res.status(400).json({ message: "maxParticipants는 1 이상의 숫자여야 합니다." });
    }
    if (!content || typeof content !== "string") {
      return res.status(400).json({ message: "content는 필수입니다." });
    }

    const challengeRequest = await createChallengeRequest({
      userId: req.user.userId,
      title,
      sourceUrl,
      field,
      docType,
      deadlineAt,
      maxParticipants,
      content,
    });

    return res.status(201).json({ data: challengeRequest });
  } catch (err) {
    next(err);
  }
}

export async function listRequests(req, res, next) {
  try {
    const { userId, requestStatus } = req.query || {};

    const parsedUserId = parseIntStrict(userId);

    if (requestStatus && !Object.values(RequestStatus).includes(requestStatus)) {
      return res.status(400).json({ message: "requestStatus 값이 올바르지 않습니다." });
    }

    const challengeRequests = await listChallengeRequests({
      userId: parsedUserId ?? undefined,
      requestStatus: requestStatus || undefined,
    });

    return res.status(200).json({ data: challengeRequests });
  } catch (err) {
    next(err);
  }
}

export async function getRequestById(req, res, next) {
  try {
    const id = parseIntStrict(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "유효한 challenge request id가 필요합니다." });
    }

    const challengeRequest = await getChallengeRequestById(id);
    if (!challengeRequest) {
      return res.status(404).json({ message: "챌린지 생성 신청을 찾을 수 없습니다." });
    }

    return res.status(200).json({ data: challengeRequest });
  } catch (err) {
    next(err);
  }
}

export async function updateRequest(req, res, next) {
  try {
    const id = parseIntStrict(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "유효한 challenge request id가 필요합니다." });
    }

    const {
      title,
      sourceUrl,
      field,
      docType,
      deadlineAt,
      maxParticipants,
      content,
    } = req.body || {};

    if (docType && !Object.values(DocType).includes(docType)) {
      return res.status(400).json({ message: "docType 값이 올바르지 않습니다." });
    }
    if (maxParticipants !== undefined && (typeof maxParticipants !== "number" || maxParticipants < 1)) {
      return res.status(400).json({ message: "maxParticipants는 1 이상의 숫자여야 합니다." });
    }

    const data = {};
    if (title !== undefined) data.title = title;
    if (sourceUrl !== undefined) data.sourceUrl = sourceUrl;
    if (field !== undefined) data.field = field;
    if (docType !== undefined) data.docType = docType;
    if (deadlineAt !== undefined) data.deadlineAt = deadlineAt;
    if (maxParticipants !== undefined) data.maxParticipants = maxParticipants;
    if (content !== undefined) data.content = content;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "수정할 값이 없습니다." });
    }

    const challengeRequest = await updateChallengeRequest({
      id,
      userId: req.user.userId,
      data,
    });

    return res.status(200).json({ data: challengeRequest });
  } catch (err) {
    next(err);
  }
}

export async function removeRequest(req, res, next) {
  try {
    const id = parseIntStrict(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "유효한 challenge request id가 필요합니다." });
    }

    await deleteChallengeRequest({ id, userId: req.user.userId });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}

export async function processRequest(req, res, next) {
  try {
    const id = parseIntStrict(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "유효한 challenge request id가 필요합니다." });
    }

    const { status, adminReason } = req.body || {};

    if (!status || !Object.values(RequestStatus).includes(status)) {
      return res.status(400).json({
        message: "status는 필수이며 APPROVED, REJECTED 중 하나여야 합니다.",
      });
    }

    // PENDING이나 CANCELLED는 처리할 수 없음 (승인/거절만 가능)
    if (status === RequestStatus.PENDING || status === RequestStatus.CANCELLED) {
      return res.status(400).json({
        message: "승인 또는 거절만 처리할 수 있습니다.",
      });
    }

    const result = await processChallengeRequest({
      id,
      userId: req.user.userId,
      role: req.user.role,
      status,
      adminReason,
    });

    // 승인 시: 생성된 챌린지 반환 (신청은 삭제됨)
    if (result.approved) {
      return res.status(201).json({
        message: "챌린지 신청이 승인되어 챌린지가 생성되었습니다.",
        data: result.challenge,
      });
    }

    // 거절 시: 업데이트된 신청 반환
    return res.status(200).json({
      message: "챌린지 신청이 거절되었습니다.",
      data: result.challengeRequest,
    });
  } catch (err) {
    next(err);
  }
}

// 승인된 ChallengeRequest 중 Challenge가 없는 것들을 마이그레이션
export async function migrateRequests(req, res, next) {
  try {
    // 관리자만 실행 가능
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "관리자만 실행할 수 있습니다." });
    }

    const result = await migrateApprovedRequests();
    return res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}
