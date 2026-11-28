const oauthService = require("../services/oauthService");

const STATE_COOKIE = "oauth_state";

const readCookie = (req, name) => {
  const raw = req.headers.cookie || "";
  const hit = raw
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return hit ? decodeURIComponent(hit.slice(name.length + 1)) : null;
};

const start = (provider) => (req, res) => {
  if (!oauthService.isConfigured(provider)) {
    return res.status(503).json({
      success: false,
      message: `${provider} sign-in is not configured yet`,
    });
  }

  const { url, state } = oauthService.buildAuthUrl(provider);
  res.cookie(STATE_COOKIE, state, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 10 * 60 * 1000,
  });
  res.redirect(url);
};

const callback = (provider) => async (req, res, next) => {
  const fail = (message) =>
    res.redirect(
      `${oauthService.FRONTEND_URL()}/auth/callback?error=${encodeURIComponent(message)}`,
    );

  try {
    const { code, state, error } = req.query;
    if (error) return fail("Sign-in was cancelled");
    if (!code) return fail("No authorisation code returned");

    if (!state || state !== readCookie(req, STATE_COOKIE))
      return fail("Sign-in expired. Try again.");

    res.clearCookie(STATE_COOKIE);

    const accessToken = await oauthService.exchangeCode(provider, code);
    const { token } = await oauthService.signIn(provider, accessToken);

    res.redirect(
      `${oauthService.FRONTEND_URL()}/auth/callback?token=${token}`,
    );
  } catch (err) {
    fail(err.message || "Sign-in failed");
  }
};

module.exports = { start, callback };
