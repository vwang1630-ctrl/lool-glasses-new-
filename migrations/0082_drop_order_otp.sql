-- OTPs now live in Cloudflare KV (OTP_KV) with a 10-minute TTL.
-- The old D1 table stored transient one-time codes and should no longer exist.

DROP TABLE IF EXISTS order_otp;
