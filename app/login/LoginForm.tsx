"use client";
import { createBrowserClient } from "@supabase/ssr";
import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState(""); const [notice, setNotice] = useState("");
  const login = async () => { const url = process.env.NEXT_PUBLIC_SUPABASE_URL; const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY; if (!url || !key) return setNotice("Supabase 설정이 필요해요."); const client = createBrowserClient(url, key); const { error } = await client.auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/admin` } }); setNotice(error ? "로그인 링크를 보내지 못했어요." : "이메일에서 로그인 링크를 확인해 주세요."); };
  return <><label>소유자 이메일<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} /></label><button className="primary" onClick={login}>로그인 링크 받기</button>{notice && <p className="notice" role="status">{notice}</p>}</>;
}
