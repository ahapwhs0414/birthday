import { describe, expect, it } from "vitest";
import { isExamCorrect, scorePractice, validateMessage, validateParticipant } from "./game";

describe("birthday game rules", () => {
  it("scores the birthday answer and timeout once", () => {
    expect(isExamCorrect(3)).toBe(true);
    expect(isExamCorrect(3, true)).toBe(false);
    expect(isExamCorrect(null)).toBe(false);
  });
  it("scores practice answers by round id", () => {
    expect(scorePractice([{ roundId: "outfit", choiceId: "nurse" }, { roundId: "snack", choiceId: "zero-candy" }, { roundId: "shoes", choiceId: "nurse-shoes" }])).toBe(2);
  });
  it("rejects empty and overlong participant input", () => {
    expect(validateParticipant("   ", "친구")).toBeTruthy();
    expect(validateParticipant("예진친구", "친구")).toBeNull();
    expect(validateParticipant("예진친구", "가".repeat(21))).toBeTruthy();
  });
  it("validates trimmed message length", () => {
    expect(validateMessage(" \n ")).toBeTruthy();
    expect(validateMessage("생일 축하해!")).toBeNull();
    expect(validateMessage("축".repeat(301))).toBeTruthy();
  });
});
