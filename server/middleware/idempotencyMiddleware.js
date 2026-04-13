import IdempotencyKey from '../models/IdempotencyKey.js';

export const requireIdempotency = async (req, res, next) => {
  if (req.method !== 'POST') return next();

  const key = req.headers['idempotency-key'];
  if (!key) {
    console.warn('[Idempotency] Missing Idempotency-Key on POST request');
    // We could enforce it by throwing 400, but let's allow bypass if header is merely undefined for easier dev debugging.
    return next();
  }

  try {
    const existing = await IdempotencyKey.findOne({ key, path: req.originalUrl });

    if (existing) {
      if (existing.responseCode) {
        console.log(`[Idempotency] Returning cached response for key: ${key}`);
        return res.status(existing.responseCode).json(existing.responseBody);
      } else {
        // Exists but no response captured yet -> another node or thread is processing it
        return res.status(409).json({ success: false, message: 'Request with this Idempotency-Key is currently being processed.' });
      }
    }

    // Create placeholder
    await IdempotencyKey.create({ key, method: req.method, path: req.originalUrl });

    // Override res.json to capture output dynamically
    const originalJson = res.json;
    res.json = function (body) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        // Cache success
        IdempotencyKey.updateOne(
          { key },
          { responseCode: res.statusCode, responseBody: body }
        ).exec();
      } else {
        // Clear placeholder on failure to allow retry
        IdempotencyKey.deleteOne({ key }).exec();
      }

      return originalJson.call(this, body);
    };

    next();
  } catch (error) {
    if (error.code === 11000) { // Race condition caught natively by unique index insert
      return res.status(409).json({ success: false, message: 'Double request caught by idempotency layer rules.' });
    }
    next(error);
  }
};
