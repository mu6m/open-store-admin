import { SignJWT, jwtVerify } from "jose";

export interface JWTPayload {
  username: string;
  iat: number;
  exp: number;
}

// Convert secret string to Uint8Array for jose
const getSecretKey = () => {
  const secret = process.env.JWT_SECRET!;
  return new TextEncoder().encode(secret);
};

export async function generateToken(username: string): Promise<string> {
  const secretKey = getSecretKey();

  return await new SignJWT({ username })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const secretKey = getSecretKey();

    const { payload } = await jwtVerify(token, secretKey);

    return {
      username: payload.username as string,
      iat: payload.iat!,
      exp: payload.exp!,
    } as JWTPayload;
  } catch (error) {
    return null;
  }
}

export function validateCredentials(
  username: string,
  password: string
): boolean {
  return (
    username === process.env.ADMIN_USER && password === process.env.ADMIN_PASS
  );
}
