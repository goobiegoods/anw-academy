import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { checkAndAwardCertifications } from "@/lib/certifications";
import { apiError, HttpError, readObject, textField } from "@/lib/http";
export async function POST(req: Request) {
  try {
    if (!(await getAdminUser()))
      throw new HttpError(403, "Registrar access required.");
    const body = await readObject(req);
    return NextResponse.json(
      await checkAndAwardCertifications(textField(body, "userId", 100, true)),
    );
  } catch (error) {
    return apiError(error);
  }
}
