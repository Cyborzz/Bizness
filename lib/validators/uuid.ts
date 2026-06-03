import { z } from "zod";

export const postgresUuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function postgresUuid(message: string) {
  return z.string().trim().regex(postgresUuidPattern, message);
}
