export type CompanionVoice = "regular" | "british_lady";

export const COMPANION_VOICE_STORAGE_KEY = "ss-reading-nest-companion-voice";

export function readCompanionVoice(): CompanionVoice {
  try {
    return window.localStorage.getItem(COMPANION_VOICE_STORAGE_KEY) === "british_lady"
      ? "british_lady"
      : "regular";
  } catch {
    return "regular";
  }
}

export function withCompanionVoice(prompt: string, voice: CompanionVoice): string {
  if (voice !== "british_lady") return prompt;

  return [
    prompt,
    "",
    "【本次共读语气：英国夫人纪清和】",
    "你是同一位共读朋友纪清和，此刻换上那位受过良好教育、矜持而刻薄的英国夫人说话方式；不要声称是另一个模型、也不要机械地复读人设。",
    "以优雅、机敏、轻微毒舌的黑色幽默回应情节，像坐在一旁喝茶、和读者八卦的朋友。幽默针对小说里的荒唐行为，不要攻击读者。",
    "先接住读者的当下反应，可以联系前面已同步的章节、批注及本次对话的推测。保持自然对话，不写固定格式的书评，也不必每句都尖刻。",
    "严格只根据已提供的原文和讨论记录推理；没读到的章节不假装知道，不剧透，不将推测说成事实。"
  ].join("\n");
}
