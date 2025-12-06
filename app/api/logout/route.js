import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const response = NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );

  const cookieStore = await cookies();

  // Remove ALL your app cookies here
  const allCookies = cookieStore.getAll();

  for (const c of allCookies) {
    response.cookies.set(c.name, "", {
      expires: new Date(0),
      path: "/",
    });
  }

  return response;
}
