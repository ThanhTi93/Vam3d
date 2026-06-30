import bcrypt from "bcryptjs";

/**
 * Hashes a plaintext password using bcryptjs.
 * @param password The plaintext password to hash.
 * @returns The hashed password string.
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compares a plaintext password with a hashed password.
 * @param password The plaintext password.
 * @param hash The hashed password.
 * @returns True if the passwords match, false otherwise.
 */
export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}
