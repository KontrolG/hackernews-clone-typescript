import jwt from "jsonwebtoken";
import { appSecret } from "./config-variables";

interface AuthPayload {
  userId: number;
}

export function decodeAuthorizationHeader(authHeader: string) {
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    throw new Error("No token found");
  }

  return jwt.verify(token, appSecret) as AuthPayload;
}
