"use client";
import { useState, type FormEvent } from "react";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState(false);

  const login = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setNotice("");
    try {
      const response = await fetch("/api/owner-login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      if (!response.ok) throw new Error("아이디 또는 비밀번호를 확인해 주세요.");
      location.replace("/admin");
    } catch {
      setNotice("아이디 또는 비밀번호를 확인해 주세요.");
      setPending(false);
    }
  };

  return <form onSubmit={login}>
    <label>아이디<input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required /></label>
    <label>비밀번호<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label>
    <button className="primary" type="submit" disabled={pending}>{pending ? "로그인 중…" : "로그인"}</button>
    {notice && <p className="notice" role="alert">{notice}</p>}
  </form>;
}
