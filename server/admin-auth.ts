import type { NextFunction, Request, Response } from "express";
import { createHmac, timingSafeEqual } from "crypto";

export type AdminUser = {
  email: string;
  name: string;
};

const ADMIN_COOKIE_NAME = "reliefworks.admin";
const COOKIE_MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7;

declare global {
  namespace Express {
    interface Request {
      adminUser?: AdminUser | null;
    }
  }
}

function getCookieSecret() {
  return process.env.SESSION_SECRET || "relief-works-development-secret";
}

function sign(value: string) {
  return createHmac("sha256", getCookieSecret()).update(value).digest("base64url");
}

function parseCookieHeader(cookieHeader: string | undefined) {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split(";").reduce<Record<string, string>>((cookies, part) => {
    const [rawName, ...rawValue] = part.trim().split("=");
    if (!rawName) {
      return cookies;
    }

    cookies[rawName] = decodeURIComponent(rawValue.join("="));
    return cookies;
  }, {});
}

function serializeAdminCookie(user: AdminUser) {
  const payload = Buffer.from(JSON.stringify(user), "utf8").toString("base64url");
  const signature = sign(payload);
  return `${payload}.${signature}`;
}

function deserializeAdminCookie(rawCookieValue: string | undefined): AdminUser | null {
  if (!rawCookieValue) {
    return null;
  }

  const [payload, signature] = rawCookieValue.split(".");
  if (!payload || !signature) {
    return null;
  }

  const expectedSignature = sign(payload);
  const providedBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    providedBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(providedBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as AdminUser;
    if (!parsed?.email || !parsed?.name) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function attachAdminUser(req: Request, _res: Response, next: NextFunction) {
  const cookies = parseCookieHeader(req.headers.cookie);
  req.adminUser = deserializeAdminCookie(cookies[ADMIN_COOKIE_NAME]);
  next();
}

export function setAdminAuthCookie(res: Response, user: AdminUser) {
  res.cookie(ADMIN_COOKIE_NAME, serializeAdminCookie(user), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: COOKIE_MAX_AGE_MS,
    path: "/",
  });
}

export function clearAdminAuthCookie(res: Response) {
  res.clearCookie(ADMIN_COOKIE_NAME, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
}
