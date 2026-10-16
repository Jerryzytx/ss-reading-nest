import { describe, expect, it } from "vitest";
import {
  COMPANION_VOICE_STORAGE_KEY,
  readCompanionVoice,
  withCompanionVoice
} from "./companion-voice.js";

describe("reading companion", () => {
  it("does not change the ordinary chat prompt", () => {
    expect(withCompanionVoice("一起聊这里", "regular")).toBe("一起聊这里");
  });

  it("gives the British lady character context without granting unseen plot knowledge", () => {
    const prompt = withCompanionVoice("一起聊这里", "british_lady");
    expect(prompt).toContain("英国夫人纪清和");
    expect(prompt).toContain("黑色幽默");
    expect(prompt).toContain("不剧透");
    expect(prompt).toContain("没读到的章节不假装知道");
  });

  it("restores the last chosen voice", () => {
    window.localStorage.setItem(COMPANION_VOICE_STORAGE_KEY, "british_lady");
    expect(readCompanionVoice()).toBe("british_lady");
    window.localStorage.removeItem(COMPANION_VOICE_STORAGE_KEY);
    expect(readCompanionVoice()).toBe("regular");
  });
});
