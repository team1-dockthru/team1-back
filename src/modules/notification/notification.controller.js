import { listNotifications, markNotificationRead } from "./notification.service.js";

const parseIntStrict = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) ? parsed : null;
};

export async function list(req, res, next) {
  try {
    const { cursor, limit, includeRead } = req.query || {};
    const parsedLimit = parseIntStrict(limit) ?? 10;

    if (parsedLimit < 1 || parsedLimit > 50) {
      return res.status(400).json({ message: "limit는 1~50 사이의 정수여야 합니다." });
    }

    const result = await listNotifications({
      userId: req.user.userId,
      cursor: cursor || null,
      limit: parsedLimit,
      includeRead: includeRead === "true",
    });

    return res.status(200).json({
      data: result.items,
      nextCursor: result.nextCursor,
      hasNext: result.hasNext,
    });
  } catch (err) {
    next(err);
  }
}

export async function read(req, res, next) {
  try {
    const id = parseIntStrict(req.params.id);
    if (!id) {
      return res.status(400).json({ message: "유효한 notification id가 필요합니다." });
    }

    const notification = await markNotificationRead({
      id,
      userId: req.user.userId,
    });

    return res.status(200).json({ data: notification });
  } catch (err) {
    next(err);
  }
}
