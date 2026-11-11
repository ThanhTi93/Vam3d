import { SignJWT, jwtVerify } from "jose";
import { getJwtKey } from "./session";

/**
 * Encrypts challenge verification status into a JWT token.
 * Expired in 2 hours by default.
 */
export async function encryptChallengeClearance(ip: string): Promise<string> {
  return new SignJWT({ verified: true, ip })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(getJwtKey());
}

/**
 * Decrypts and verifies a JWT challenge clearance token.
 * Returns the decoded payload or null if verification fails.
 */
export async function decryptChallengeClearance(token: string): Promise<any | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getJwtKey(), {
      algorithms: ["HS256"],
    });
    return payload;
  } catch {
    // Silently ignore or log verification failures (expired/invalid)
    return null;
  }
}
