import { addLike, getLikeCount, removeLike } from "./like.service.js";

const parseIntStrict = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

export async function count(req, res, next) {
  try {
    const workId = parseIntStrict(req.params.workId);
    if (!workId) {
      return res.status(400).json({ message: "유효한 work id가 필요합니다." });
    }

    const result = await getLikeCount({ workId });

    return res.status(200).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function add(req, res, next) {
  try {
    const workId = parseIntStrict(req.params.workId);
    if (!workId) {
      return res.status(400).json({ message: "유효한 work id가 필요합니다." });
    }

    const result = await addLike({
      workId,
      userId: req.user.userId,
    });

    return res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
}

export async function remove(req, res, next) {
  try {
    const workId = parseIntStrict(req.params.workId);
    if (!workId) {
      return res.status(400).json({ message: "유효한 work id가 필요합니다." });
    }

    await removeLike({
      workId,
      userId: req.user.userId,
    });

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
