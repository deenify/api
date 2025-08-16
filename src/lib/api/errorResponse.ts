import { NextResponse } from "next/server";

function errorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
export default errorResponse;
