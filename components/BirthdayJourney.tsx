"use client";

import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import { birthdayContent, type PracticeAnswer } from "@/lib/content";
import { isExamCorrect, scorePractice, validateMessage, validateParticipant } from "@/lib/game";

type Step = "story" | "info" | "exam-intro" | "exam" | "exam-result" | "practice-intro" | "practice" | "practice-result" | "message" | "submitting" | "completed";
type Draft = { step: Step; storyIndex: number; displayName: string; relationship: string; relationshipChoice: string; examChoice: number | null; examScore: 0 | 100; answers: PracticeAnswer[]; message: string; submissionKey: string; recordId?: string };

const initialDraft = (): Draft => ({ step: "story", storyIndex: 0, displayName: "", relationship: "", relationshipChoice: "", examChoice: null, examScore: 0, answers: [], message: "", submissionKey: crypto.randomUUID() });
const stepOrder: Step[] = ["story", "info", "exam-intro", "exam", "exam-result", "practice-intro", "practice", "practice-result", "message", "submitting", "completed"];

export default function BirthdayJourney() {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [seconds, setSeconds] = useState<number>(birthdayContent.exam.timeLimit);
  const [error, setError] = useState("");
  const [shareNotice, setShareNotice] = useState("");
  const locked = useRef(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("yejin-birthday-draft");
      const parsed = saved ? JSON.parse(saved) as Draft : initialDraft();
      const migrated = { ...parsed, relationshipChoice: parsed.relationshipChoice ?? parsed.relationship ?? "" };
      setDraft(migrated.step === "submitting" ? { ...migrated, step: "message" } : migrated);
    } catch { setDraft(initialDraft()); }
  }, []);
  useEffect(() => { if (draft) localStorage.setItem("yejin-birthday-draft", JSON.stringify(draft)); }, [draft]);

  const finishExam = useCallback((choice: number | null, timedOut = false) => {
    if (locked.current) return;
    locked.current = true;
    setDraft((current) => current && ({ ...current, examChoice: choice, examScore: isExamCorrect(choice, timedOut) ? 100 : 0, step: "exam-result" }));
  }, []);
  useEffect(() => {
    if (draft?.step !== "exam") return;
    locked.current = false;
    setSeconds(birthdayContent.exam.timeLimit);
    const started = Date.now();
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, birthdayContent.exam.timeLimit - Math.floor((Date.now() - started) / 1000));
      setSeconds(remaining);
      if (remaining === 0) { window.clearInterval(timer); finishExam(null, true); }
    }, 200);
    return () => window.clearInterval(timer);
  }, [draft?.step, finishExam]);

  if (!draft) return <main className="shell"><div className="card loading" aria-live="polite">생일 파티를 준비하고 있어요…</div></main>;
  const update = (patch: Partial<Draft>) => { setError(""); setDraft({ ...draft, ...patch }); };
  const practiceRound = birthdayContent.practice[draft.answers.length];
  const practiceScore = scorePractice(draft.answers);
  const progress = Math.max(4, ((stepOrder.indexOf(draft.step) + (draft.step === "story" ? draft.storyIndex / 4 : 0)) / (stepOrder.length - 1)) * 100);

  const choosePractice = (choiceId: string) => {
    if (!practiceRound) return;
    const answers = [...draft.answers, { roundId: practiceRound.id, choiceId }];
    update({ answers, step: answers.length === birthdayContent.practice.length ? "practice-result" : "practice" });
  };
  const submit = async () => {
    const messageError = validateMessage(draft.message); if (messageError) return setError(messageError);
    update({ step: "submitting" });
    try {
      const response = await fetch("/api/participations", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ recipientId: birthdayContent.recipient.id, displayName: draft.displayName, relationship: draft.relationship === "비공개" ? "" : draft.relationship, examChoice: draft.examChoice, examScore: draft.examScore, practiceAnswers: draft.answers, practiceScore, message: draft.message, clientSubmissionKey: draft.submissionKey }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message ?? "저장하지 못했어요.");
      update({ step: "completed", recordId: result.id });
    } catch (reason) { setError(reason instanceof Error ? reason.message : "잠시 후 다시 시도해 주세요."); update({ step: "message" }); }
  };
  const share = async () => {
    const data = { title: document.title, text: "예진이의 22번째 생일을 같이 축하해 주세요!", url: location.origin };
    try { if (navigator.share) await navigator.share(data); else { await navigator.clipboard.writeText(location.origin); setShareNotice("참여 링크를 복사했어요!"); } } catch { /* sharing was cancelled */ }
  };

  return <main className="shell">
    <header className="topbar"><span className="brand">YEJIN&apos;S DAY</span><span className="step-label">{draft.step === "story" ? `${draft.storyIndex + 1} / 4` : "생일 도와주기"}</span></header>
    <div className="progress" role="progressbar" aria-label="진행률" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}><i style={{ width: `${progress}%` }} /></div>
    <section className="card" aria-live="polite">
      {draft.step === "story" && <Story index={draft.storyIndex} previous={() => update({ storyIndex: Math.max(0, draft.storyIndex - 1) })} next={() => draft.storyIndex < 3 ? update({ storyIndex: draft.storyIndex + 1 }) : update({ step: "info" })} />}
      {draft.step === "info" && <><Eyebrow>첫 번째 부탁</Eyebrow><div className="hero-emoji">👋</div><h1>예진이를 도와줄<br />당신의 이름은 무엇인가요?</h1><p>실명이 아니어도 괜찮아요. 친구들이 알아볼 별명도 좋아요.</p><label>이름 또는 별명<input maxLength={30} value={draft.displayName} onChange={(e) => update({ displayName: e.target.value })} placeholder="예: 예진이 절친" autoFocus /></label><label>예진이와의 관계<select value={draft.relationshipChoice} onChange={(e) => update({ relationshipChoice: e.target.value, relationship: e.target.value === "직접 입력" ? "" : e.target.value })}><option value="">선택하지 않기</option><option>친구</option><option>가족</option><option>연인</option><option>직장/학교 지인</option><option>비공개</option><option value="직접 입력">직접 입력</option></select></label>{draft.relationshipChoice === "직접 입력" && <label>관계 직접 입력<input maxLength={20} value={draft.relationship} onChange={(e) => update({ relationship: e.target.value })} /></label>}<ErrorText text={error} /><button className="primary" onClick={() => { const e = validateParticipant(draft.displayName, draft.relationship); if (e) setError(e); else update({ step: "exam-intro" }); }}>다음</button></>}
      {draft.step === "exam-intro" && <Intro emoji="📖" eyebrow="시험 미션" title="몰래 정답을 알려주세요!" text="시험 기간에도 공부해야 하는 예진이를 위해 생일 퀴즈를 맞혀 주세요. 제한 시간은 단 5초예요!" button="시험 시작" onClick={() => update({ step: "exam" })} />}
      {draft.step === "exam" && <><div className={`timer ${seconds <= 2 ? "urgent" : ""}`} aria-label={`${seconds}초 남음`}>{seconds}</div><Eyebrow>생일 퀴즈</Eyebrow><h1>{birthdayContent.exam.question}</h1><div className="choices">{birthdayContent.exam.choices.map((choice, index) => <button className="choice" key={choice} onClick={() => finishExam(index)}><span>{index + 1}</span>{choice}</button>)}</div></>}
      {draft.step === "exam-result" && <><div className="score-paper"><small>생일 시험</small><strong>{draft.examScore}</strong><span>점</span></div><h1>{draft.examScore ? "예진이가 시험에 100점을 맞았어요!" : "괜찮아요, 이제는 꼭 기억해요!"}</h1><p>{draft.examScore ? "완벽한 도움 덕분에 예진이가 활짝 웃었어요 😊" : "예진이의 생일은 2005년 9월 20일이에요."}</p><button className="primary" onClick={() => update({ step: "practice-intro" })}>{draft.examScore ? "실습하러 가기" : "그래도 실습하러 가기"}</button></>}
      {draft.step === "practice-intro" && <Intro emoji="🥱" eyebrow="실습 미션" title="예진이의 짐을 챙겨주세요!" text="내일 출근해야 하는 예진이는 준비하는 게 제일 힘들어요. 세 가지 준비물을 골라주세요." button="실습 시작" onClick={() => update({ step: "practice" })} />}
      {draft.step === "practice" && practiceRound && <><Eyebrow>준비물 {draft.answers.length + 1} / 3</Eyebrow><div className="avatar"><span>👩🏻</span>{draft.answers.map((answer) => <small key={answer.roundId}>{birthdayContent.practice.find(r => r.id === answer.roundId)?.options.find(o => o.id === answer.choiceId)?.emoji}</small>)}</div><h1>{practiceRound.prompt}</h1><div className="practice-grid">{practiceRound.options.map((option) => <button key={option.id} onClick={() => choosePractice(option.id)}><b>{option.emoji}</b><span>{option.label}</span></button>)}</div></>}
      {draft.step === "practice-result" && <><div className="hero-emoji">🎒</div><Eyebrow>준비 완료</Eyebrow><h1>3개 중 {practiceScore}개를 맞혔어요!</h1><div className="answer-list">{draft.answers.map((answer) => { const round = birthdayContent.practice.find(r => r.id === answer.roundId)!; const option = round.options.find(o => o.id === answer.choiceId)!; return <div key={answer.roundId}><span>{option.emoji} {option.label}</span><b>{answer.choiceId === round.correctId ? "✓" : "아차!"}</b></div>; })}</div><button className="primary" onClick={() => update({ step: "message" })}>마지막 부탁 보기</button></>}
      {(draft.step === "message" || draft.step === "submitting") && <><div className="hero-emoji">💌</div><Eyebrow>마지막 한마디</Eyebrow><h1>{draft.displayName.trim()}의 축하가<br />예진이를 더 행복하게 해요!</h1><label>축하 메시지<textarea maxLength={300} rows={5} value={draft.message} onChange={(e) => update({ message: e.target.value })} placeholder="예진아, 22번째 생일 정말 축하해! 오늘은 꼭 행복하게 쉬어야 해 🎂" /></label><div className="counter">{draft.message.length} / 300</div><ErrorText text={error} /><button className="primary" disabled={draft.step === "submitting"} onClick={submit}>{draft.step === "submitting" ? "소중히 저장하는 중…" : "축하 메시지 보내기"}</button></>}
      {draft.step === "completed" && <><div className="confetti" aria-hidden>✦ 🎉 ✦</div><Eyebrow>축하 배달 완료</Eyebrow><h1>{draft.displayName.trim()} 덕분에<br />예진이의 22번째 생일이<br />더욱 행복해졌어요!</h1><div className="result-summary"><div><small>시험</small><strong>{draft.examScore}점</strong></div><div><small>실습</small><strong>{practiceScore}/3</strong></div></div><blockquote>{draft.message}</blockquote><button className="primary" onClick={share}>친구에게 참여 링크 보내기</button><button className="secondary" onClick={() => update({ step: "completed" })}>내 기록 다시 보기</button>{shareNotice && <p className="notice">{shareNotice}</p>}</>}
    </section>
    <footer>예진이의 스물두 번째 생일 · 2026</footer>
  </main>;
}

function Story({ index, previous, next }: { index: number; previous: () => void; next: () => void }) {
  const item = birthdayContent.story[index];
  const touchStart = useRef(0);
  const endSwipe = (event: TouchEvent) => { const distance = event.changedTouches[0].clientX - touchStart.current; if (distance < -45) next(); if (distance > 45 && index > 0) previous(); };
  return <div className="story" onTouchStart={(event) => { touchStart.current = event.touches[0].clientX; }} onTouchEnd={endSwipe}><Eyebrow>생일 이야기</Eyebrow><div className="story-art"><span>{item.emoji}</span><i className={index === 3 ? "help-label" : undefined}>{index === 0 ? "22" : index === 3 ? "HELP!" : ""}</i></div><h1>{item.title}</h1><p>{item.detail}</p><div className="dots">{birthdayContent.story.map((_, i) => <i key={i} className={i === index ? "active" : ""} />)}</div><div className="actions">{index > 0 && <button className="secondary" onClick={previous}>이전</button>}<button className="primary" onClick={next}>{index === 3 ? "예진이 도와주기" : "다음 이야기"}</button></div></div>;
}
function Intro({ emoji, eyebrow, title, text, button, onClick }: { emoji: string; eyebrow: string; title: string; text: string; button: string; onClick: () => void }) { return <><Eyebrow>{eyebrow}</Eyebrow><div className="hero-emoji">{emoji}</div><h1>{title}</h1><p>{text}</p><button className="primary" onClick={onClick}>{button}</button></>; }
function Eyebrow({ children }: { children: React.ReactNode }) { return <span className="eyebrow">{children}</span>; }
function ErrorText({ text }: { text: string }) { return text ? <p className="error" role="alert">{text}</p> : null; }
