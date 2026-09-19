import { birthdayContent, type PracticeAnswer } from "./content";

export const isExamCorrect = (choice: number | null, timedOut = false) =>
  !timedOut && choice === birthdayContent.exam.correctIndex;

export function scorePractice(answers: PracticeAnswer[]) {
  return birthdayContent.practice.reduce((score, round) =>
    score + (answers.find((answer) => answer.roundId === round.id)?.choiceId === round.correctId ? 1 : 0), 0);
}

export function validateParticipant(displayName: string, relationship: string) {
  const name = displayName.trim();
  const relation = relationship.trim();
  if (!name || name.length > 30) return "이름 또는 별명을 1~30자로 입력해 주세요.";
  if (relation.length > 20) return "관계는 20자 이하로 입력해 주세요.";
  return null;
}

export function validateMessage(message: string) {
  const value = message.trim();
  if (!value || value.length > 300) return "축하 메시지를 1~300자로 입력해 주세요.";
  return null;
}
