import { redirect } from "next/navigation";
import { createUserClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export default async function AdminPage() {
  if (!process.env.OWNER_EMAIL) return <main className="admin"><h1>소유자 설정이 필요해요</h1><p>OWNER_EMAIL 환경 변수를 먼저 설정해 주세요.</p></main>;
  const supabase = await createUserClient();
  if (!supabase) return <main className="admin"><h1>환경 설정이 필요해요</h1><p>Supabase 환경 변수를 먼저 설정해 주세요.</p></main>;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.email !== process.env.OWNER_EMAIL) redirect("/login");
  const { data } = await supabase.from("participations").select("*").eq("recipient_id", "yejin-22").order("created_at", { ascending: false });
  return <main className="admin"><header><span>YEJIN&apos;S DAY</span><h1>도착한 축하 메시지</h1><p>총 {data?.length ?? 0}명이 예진이의 생일을 함께했어요.</p></header><section>{data?.map((item) => <article key={item.id}><div><strong>{item.display_name}</strong>{item.relationship && <span>{item.relationship}</span>}<time>{new Date(item.created_at).toLocaleString("ko-KR")}</time></div><blockquote>{item.message}</blockquote><footer>시험 {item.exam_score}점 · 실습 {item.practice_score}/3</footer></article>)}</section></main>;
}
