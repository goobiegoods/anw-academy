import { NextResponse } from "next/server";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}
export async function readObject(
  req: Request,
): Promise<Record<string, unknown>> {
  if (Number(req.headers.get("content-length") || 0) > 100_000)
    throw new HttpError(413, "Request too large.");
  let value: unknown;
  try {
    value = JSON.parse(await req.text());
  } catch {
    throw new HttpError(400, "Invalid JSON.");
  }
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new HttpError(400, "Expected an object.");
  return value as Record<string, unknown>;
}
export function textField(
  data: Record<string, unknown>,
  key: string,
  max: number,
  required = false,
) {
  const value = data[key];
  if (value !== undefined && value !== null && typeof value !== "string")
    throw new HttpError(400, `Invalid ${key}.`);
  const text = typeof value === "string" ? value.trim() : "";
  if ((required && !text) || text.length > max)
    throw new HttpError(400, `Invalid ${key}.`);
  return text;
}
export function apiError(error: unknown) {
  if (error instanceof HttpError)
    return NextResponse.json(
      { error: error.message },
      { status: error.status },
    );
  console.error(
    "Academy request failed",
    error instanceof Error ? error.name : "UnknownError",
  );
  return NextResponse.json(
    { error: "We could not save this change. Please try again." },
    { status: 503 },
  );
}
