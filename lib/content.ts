export const birthdayContent = {
  recipient: { id: "yejin-22", name: "예진", birthDate: "2005-09-20", birthdayLabel: "22번째 생일" },
  story: [
    { emoji: "🎂", title: "예진이의 22번째 생일을 축하해주세요!", detail: "큰 초 2개, 작은 초 2개를 켰어요." },
    { emoji: "🥺", title: "하지만 예진이는 너무 슬퍼요", detail: "생일인데도 마음 편히 쉴 수가 없대요." },
    { emoji: "📚", title: "할 일이 너무 많기 때문이에요", detail: "시험과 내일 준비가 예진이를 기다리고 있어요." },
    { emoji: "🫶", title: "여러분의 도움이 필요해요!", detail: "예진이가 생일 동안 쉴 수 있게 함께 도와주세요." },
  ],
  exam: {
    question: "예진이의 생일은 언제일까요?",
    timeLimit: 5,
    choices: ["2006년 8월 20일", "2005년 8월 20일", "2005년 8월 21일", "2005년 9월 20일"],
    correctIndex: 3,
  },
  practice: [
    { id: "outfit", prompt: "출근할 때 입을 옷은?", options: [{ id: "nurse", label: "간호사 옷", emoji: "🩺" }, { id: "firefighter", label: "소방관 옷", emoji: "🧯" }], correctId: "nurse" },
    { id: "snack", prompt: "힘을 내게 해 줄 간식은?", options: [{ id: "zero-candy", label: "제로 슈거 사탕", emoji: "🍬" }, { id: "sugar-candy", label: "슈거 사탕", emoji: "🍭" }], correctId: "sugar-candy" },
    { id: "shoes", prompt: "오래 서 있어도 든든한 신발은?", options: [{ id: "crocs", label: "크록스", emoji: "🩴" }, { id: "nurse-shoes", label: "간호화", emoji: "👟" }], correctId: "nurse-shoes" },
  ],
} as const;

export type PracticeAnswer = { roundId: string; choiceId: string };
