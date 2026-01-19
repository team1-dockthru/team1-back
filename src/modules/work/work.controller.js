import {
  createWork,
  getWorkById,
  listWorks,
  updateWork,
  deleteWork,
  WorkStatus,
} from "./work.service.js";

const parseIntStrict = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

export async function create(req, res, next) {
  try {
    const { challengeId, title, content, originalUrl } = req.body || {};
    const parsedChallengeId = parseIntStrict(challengeId);

    if (!parsedChallengeId) {
      return res.status(400).json({ message: "challengeId는 필수입니다." });
    }
    if (!title || typeof title !== "string") {
      return res.status(400).json({ message: "title은 필수입니다." });
    }
    if (!content || typeof content !== "string") {
      return res.status(400).json({ message: "content는 필수입니다." });
    }

    const work = await createWork({
      userId: req.user.userId,
      challengeId: parsedChallengeId,
      title,
      content,
      originalUrl,
    });

    return res.status(201).json({ data: work });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { challengeId, userId, workStatus } = req.query || {};
    const parsedChallengeId = parseIntStrict(challengeId);

    if (workStatus && !Object.values(WorkStatus).includes(workStatus)) {
      return res.status(400).json({ message: "workStatus 값이 올바르지 않습니다." });
    }

    const works = await listWorks({
      challengeId: parsedChallengeId ?? undefined,
      userId: userId || undefined,
      workStatus: workStatus || undefined,
    });

    return res.status(200).json({ data: works });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const id = parseIntStrict(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "유효한 work id가 필요합니다." });
    }

    const work = await getWorkById(id);
    if (!work) {
      return res.status(404).json({ message: "작업물을 찾을 수 없습니다." });
    }

    return res.status(200).json({ data: work });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const id = parseIntStrict(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "유효한 work id가 필요합니다." });
    }

    const { title, content, originalUrl, workStatus } = req.body || {};
    if (workStatus && !Object.values(WorkStatus).includes(workStatus)) {
      return res.status(400).json({ message: "workStatus 값이 올바르지 않습니다." });
    }

    const data = {};
    if (title !== undefined) data.title = title;
    if (content !== undefined) data.content = content;
    if (originalUrl !== undefined) data.originalUrl = originalUrl;
    if (workStatus) data.workStatus = workStatus;

    if (Object.keys(data).length === 0) {
      return res.status(400).json({ message: "수정할 값이 없습니다." });
    }

    const work = await updateWork({
      id,
      userId: req.user.userId,
      data,
    });

    return res.status(200).json({ data: work });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const id = parseIntStrict(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "유효한 work id가 필요합니다." });
    }

    await deleteWork({ id, userId: req.user.userId });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
