import {
  createFeedback,
  getFeedbackById,
  listFeedbacks,
  updateFeedback,
  deleteFeedback,
} from "./feedback.service.js";

const parseIntStrict = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

export async function create(req, res, next) {
  try {
    const { workId, content } = req.body || {};
    const parsedWorkId = parseIntStrict(req.params.workId) ?? parseIntStrict(workId);

    if (!parsedWorkId) {
      return res.status(400).json({ message: "workId는 필수입니다." });
    }
    if (!content || typeof content !== "string") {
      return res.status(400).json({ message: "content는 필수입니다." });
    }

    const feedback = await createFeedback({
      userId: req.user.userId,
      workId: parsedWorkId,
      content,
    });

    return res.status(201).json({ data: feedback });
  } catch (err) {
    next(err);
  }
}

export async function list(req, res, next) {
  try {
    const { workId, userId, page } = req.query || {};
    const parsedWorkId = parseIntStrict(req.params.workId) ?? parseIntStrict(workId);
    const parsedUserId = parseIntStrict(userId);
    const parsedPage = parseIntStrict(page) ?? 1;

    if (parsedPage < 1) {
      return res.status(400).json({ message: "page는 1 이상의 정수여야 합니다." });
    }

    const result = await listFeedbacks({
      workId: parsedWorkId ?? undefined,
      userId: parsedUserId ?? undefined,
      page: parsedPage,
    });

    const totalPages = result.total === 0 ? 0 : Math.ceil(result.total / result.limit);

    return res.status(200).json({
      data: result.items,
      page: result.page,
      limit: result.limit,
      total: result.total,
      totalPages,
      hasNext: result.page < totalPages,
      hasPrev: result.page > 1,
    });
  } catch (err) {
    next(err);
  }
}

export async function getById(req, res, next) {
  try {
    const id = parseIntStrict(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "유효한 feedback id가 필요합니다." });
    }

    const feedback = await getFeedbackById(id);
    if (!feedback) {
      return res.status(404).json({ message: "피드백을 찾을 수 없습니다." });
    }

    return res.status(200).json({ data: feedback });
  } catch (err) {
    next(err);
  }
}

export async function update(req, res, next) {
  try {
    const id = parseIntStrict(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "유효한 feedback id가 필요합니다." });
    }

    const { content } = req.body || {};
    if (content === undefined || content === null || content === "") {
      return res.status(400).json({ message: "content는 필수입니다." });
    }

    const feedback = await updateFeedback({
      id,
      userId: req.user.userId,
      data: { content },
    });

    return res.status(200).json({ data: feedback });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const id = parseIntStrict(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "유효한 feedback id가 필요합니다." });
    }

    await deleteFeedback({ id, userId: req.user.userId });
    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
