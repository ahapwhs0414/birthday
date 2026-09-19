import { NextResponse } from "next/server";
import { participationSchema } from "@/lib/schema";
import { createAdminClient } from "@/lib/supabase";

export async function POST(request: Request) {
  const parsed = participationSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ message: "입력 내용을 다시 확인해 주세요." }, { status: 400 });
  const value = parsed.data;
  if (value.displayName === "테스트") {
    return NextResponse.json({ id: null, testMode: true });
  }
  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ message: "아직 저장소 연결이 준비되지 않았어요. 운영자에게 알려주세요." }, { status: 503 });
  const { data, error } = await supabase.from("participations").upsert({ recipient_id: value.recipientId, display_name: value.displayName, relationship: value.relationship || null, exam_choice: value.examChoice, exam_score: value.examScore, practice_answers: value.practiceAnswers, practice_score: value.practiceScore, message: value.message, client_submission_key: value.clientSubmissionKey }, { onConflict: "client_submission_key", ignoreDuplicates: false }).select("id").single();
  if (error) return NextResponse.json({ message: "메시지를 저장하지 못했어요. 잠시 후 다시 시도해 주세요." }, { status: 500 });
  return NextResponse.json({ id: data.id }, { status: 201 });
}
