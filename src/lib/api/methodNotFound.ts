// lib/api/methodNotFound.ts
import { NextResponse } from "next/server";

export const methodNotFound = () => {
  return NextResponse.json({ error: "Not Found" }, { status: 404 });
};
