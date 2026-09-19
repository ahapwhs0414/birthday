import { NextResponse } from "next/server";
import { createUserClient } from "@/lib/supabase-server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (typeof body?.username !== "string" || typeof body?.password !== "string" ||
      body.username.length > 40 || body.password.length > 128) {
    return NextResponse.json({ message: "아이디 또는 비밀번호를 확인해 주세요." }, { status: 400 });
  }

  const username = process.env.OWNER_USERNAME;
  const email = process.env.OWNER_EMAIL;
  if (!username || !email) {
    return NextResponse.json({ message: "소유자 설정이 필요해요." }, { status: 503 });
  }
  if (body.username !== username) {
    return NextResponse.json({ message: "아이디 또는 비밀번호를 확인해 주세요." }, { status: 401 });
  }

  const supabase = await createUserClient();
  if (!supabase) {
    return NextResponse.json({ message: "Supabase 설정이 필요해요." }, { status: 503 });
  }
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: body.password });
  if (error || data.user?.email !== email) {
    return NextResponse.json({ message: "아이디 또는 비밀번호를 확인해 주세요." }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
