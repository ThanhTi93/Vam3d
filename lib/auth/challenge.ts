import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "default_super_secret_key_that_is_at_least_32_characters_long_for_safety";
const encodedKey = new TextEncoder().encode(JWT_SECRET);

/**
 * Encrypts challenge verification status into a JWT token.
 * Expired in 2 hours by default.
 */
export async function encryptChallengeClearance(ip: string): Promise<string> {
  return new SignJWT({ verified: true, ip })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("2h")
    .sign(encodedKey);
}

/**
 * Decrypts and verifies a JWT challenge clearance token.
 * Returns the decoded payload or null if verification fails.
 */
export async function decryptChallengeClearance(token: string): Promise<any | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload;
  } catch (error) {
    // Silently ignore or log verification failures (expired/invalid)
    return null;
  }
}
