const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const { signToken } = require("../utils/token");

const API_URL = () => process.env.API_URL || "http://localhost:5000";
const FRONTEND_URL = () => process.env.FRONTEND_URL || "http://localhost:5173";

// v19.0 expired 2026-05-21; v26.0 is the current Graph API version.
const GRAPH_VERSION = "v26.0";

const providers = {
  google: {
    authUrl: "https://accounts.google.com/o/oauth2/v2/auth",
    tokenUrl: "https://oauth2.googleapis.com/token",
    scope: "openid email profile",
    clientId: () => process.env.GOOGLE_CLIENT_ID,
    clientSecret: () => process.env.GOOGLE_CLIENT_SECRET,
    async profile(accessToken) {
      const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error("Google profile request failed");
      const data = await res.json();
      return { id: data.sub, name: data.name, email: data.email };
    },
  },
  facebook: {
    authUrl: `https://www.facebook.com/${GRAPH_VERSION}/dialog/oauth`,
    tokenUrl: `https://graph.facebook.com/${GRAPH_VERSION}/oauth/access_token`,
    scope: "email",
    clientId: () => process.env.FACEBOOK_APP_ID,
    clientSecret: () => process.env.FACEBOOK_APP_SECRET,
    async profile(accessToken) {
      const res = await fetch(
        `https://graph.facebook.com/${GRAPH_VERSION}/me?fields=id,name,email&access_token=${accessToken}`,
      );
      if (!res.ok) throw new Error("Facebook profile request failed");
      const data = await res.json();
      return { id: data.id, name: data.name, email: data.email };
    },
  },
};

const isConfigured = (provider) => {
  const p = providers[provider];
  return Boolean(p && p.clientId() && p.clientSecret());
};

const redirectUri = (provider) =>
  `${API_URL()}/user/auth/${provider}/callback`;

const buildAuthUrl = (provider) => {
  const p = providers[provider];
  const params = new URLSearchParams({
    client_id: p.clientId(),
    redirect_uri: redirectUri(provider),
    response_type: "code",
    scope: p.scope,
    state: crypto.randomBytes(16).toString("hex"),
  });

  if (provider === "google") params.set("access_type", "offline");
  if (provider === "google") params.set("prompt", "select_account");

  return { url: `${p.authUrl}?${params}`, state: params.get("state") };
};

const exchangeCode = async (provider, code) => {
  const p = providers[provider];
  const params = new URLSearchParams({
    client_id: p.clientId(),
    client_secret: p.clientSecret(),
    redirect_uri: redirectUri(provider),
    code,
    grant_type: "authorization_code",
  });

  // Google's token endpoint rejects GET (404); POST form body works for both providers.
  const res = await fetch(p.tokenUrl, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: params,
  });
  const data = await res.json();
  if (!res.ok || !data.access_token)
    throw new Error(
      data.error_description || data.error?.message || data.error || "Token exchange failed",
    );

  return data.access_token;
};

const signIn = async (provider, accessToken) => {
  const info = await providers[provider].profile(accessToken);
  if (!info.email) throw new Error("That account has no email address");

  let user = await User.findOne({ provider, providerId: info.id });

  if (!user) {
    user = await User.findOne({ email: info.email });
  }

  if (user) {
    if (user.isBlocked) throw new Error("Account blocked. Contact support.");
    user.provider = provider;
    user.providerId = info.id;
    user.emailVerified = true;
    if (!user.name && info.name) user.name = info.name;
    await user.save();
  } else {
    const random = crypto.randomBytes(24).toString("hex");
    user = await User.create({
      name: info.name || info.email.split("@")[0],
      email: info.email,
      phone: "+910000000000",
      passwordHash: await bcrypt.hash(random, 10),
      provider,
      providerId: info.id,
      emailVerified: true,
    });
  }

  return {
    token: signToken(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  };
};

module.exports = {
  isConfigured,
  buildAuthUrl,
  exchangeCode,
  signIn,
  FRONTEND_URL,
};
