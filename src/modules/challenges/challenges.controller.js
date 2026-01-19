import {
  createChallenge,
  getChallengeById,
  listChallenges,
  updateChallenge,
  deleteChallenge,
  ChallengeStatus,
  DocType,
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
    const { userId, challengeStatus, field, docType } = req.query || {};

    const parsedUserId = parseIntStrict(userId);

    if (challengeStatus && !Object.values(ChallengeStatus).includes(challengeStatus)) {
      return res.status(400).json({ message: "challengeStatus 값이 올바르지 않습니다." });
    }
    if (docType && !Object.values(DocType).includes(docType)) {
      return res.status(400).json({ message: "docType 값이 올바르지 않습니다." });
    }

    const challenges = await listChallenges({
      userId: parsedUserId ?? undefined,
      challengeStatus: challengeStatus || undefined,
      field: field || undefined,
      docType: docType || undefined,
    });

    return res.status(200).json({ data: challenges });
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
