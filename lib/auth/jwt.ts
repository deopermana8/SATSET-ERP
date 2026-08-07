import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_ACCESS_SECRET;

if (!SECRET || SECRET.length < 32) {
  throw new Error("JWT_ACCESS_SECRET must be set and at least 32 characters long.");
}

export function signToken(payload: object) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string) {
  return jwt.verify(token, SECRET);
}
