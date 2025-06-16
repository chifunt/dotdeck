/**
 * @file Simple in-memory rate limiter.
 *
 *  - Fixed-window counter (1-minute buckets)
 *  - Separate configs for `auth` and `general`
 *  - Key = req.user.id (if authenticated) else IP
 *
 * NOTE: State lives in memory → resets when the process restarts
 *       and does NOT sync across clusters / Docker replicas.
 */

const windows = {
  auth: { size: 60 * 1000, max: 5 }, // 5 per minute
  api: { size: 60 * 1000, max: 100 }, // 100 per minute
};

const buckets = new Map(); // key -> { reset:number, count:number }

/**
 * Factory that returns an Express middleware with the given window config.
 * @param {{size:number,max:number}} cfg
 */
function makeLimiter(cfg) {
  return (req, res, next) => {
    // ---- pick key ----
    const key = req.user?.id ?? req.ip;

    const now = Date.now();
    let bucket = buckets.get(key);

    // ---- new bucket or reset? ----
    if (!bucket || now > bucket.reset) {
      bucket = { reset: now + cfg.size, count: 0 };
    }

    bucket.count += 1;
    buckets.set(key, bucket);

    // ---- headers ----
    res.setHeader("X-RateLimit-Limit", cfg.max);
    res.setHeader("X-RateLimit-Remaining", Math.max(cfg.max - bucket.count, 0));
    res.setHeader("X-RateLimit-Reset", Math.ceil(bucket.reset / 1000)); // epoch seconds

    // ---- over the limit? ----
    if (bucket.count > cfg.max) {
      return res
        .status(429)
        .json({ message: "Rate limit exceeded. Try again later." });
    }

    return next();
  };
}

export const rateLimitAuth = makeLimiter(windows.auth);
export const rateLimitGeneral = makeLimiter(windows.api);
