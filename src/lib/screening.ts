export type CallDecision = "allow" | "reject" | "mute";

export type CallKind = "contact" | "unknown" | "private";

export function digitsOf(value: string): string {
  return value.replace(/\D/g, "");
}

export function normalizeNumber(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const digits = digitsOf(trimmed);
  if (!digits) return "";
  if (trimmed.startsWith("+")) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  if (digits.length === 11 && digits.startsWith("0")) return `+91${digits.slice(1)}`;
  if (digits.length === 12 && digits.startsWith("91")) return `+${digits}`;
  return `+${digits}`;
}

export function numbersMatch(a: string, b: string): boolean {
  const da = digitsOf(a);
  const db = digitsOf(b);
  if (!da || !db) return false;
  if (da === db) return true;
  const ta = da.slice(-10);
  const tb = db.slice(-10);
  return ta.length >= 8 && ta === tb;
}

export function isPrivateNumber(value: string): boolean {
  const raw = value.trim().toLowerCase();
  if (!raw) return true;
  return raw === "private" || raw === "unknown" || raw === "restricted" || raw === "hidden";
}

export function inNumberList(number: string, list: string[]): boolean {
  if (isPrivateNumber(number)) return false;
  return list.some((item) => numbersMatch(number, item));
}

export function formatNumber(value: string): string {
  if (isPrivateNumber(value)) return "Private number";
  const digits = digitsOf(value);
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (value.startsWith("+") && digits.length > 6) {
    return `+${digits.slice(0, digits.length - 10)} ${digits.slice(-10, -5)} ${digits.slice(-5)}`.replace(/\s+/g, " ").trim();
  }
  return value.trim();
}

export const MUTE_LIMIT = 20;

export type ScreenInput = {
  screeningEnabled: boolean;
  rejectAll: boolean;
  rejectUnknown: boolean;
  muteUnknown: boolean;
  muteList: string[];
  contacts: string[];
  number: string;
};

export function screenCall(input: ScreenInput): CallDecision {
  if (!input.screeningEnabled) return "allow";
  if (input.rejectAll) return "reject";

  const privateCaller = isPrivateNumber(input.number);
  if (!privateCaller && inNumberList(input.number, input.muteList)) {
    return "mute";
  }

  const known = !privateCaller && inNumberList(input.number, input.contacts);
  if (!known && input.rejectUnknown) return "reject";
  if (!known && input.muteUnknown) return "mute";
  return "allow";
}

export function describeMode(input: {
  screeningEnabled: boolean;
  rejectAll: boolean;
  rejectUnknown: boolean;
  muteUnknown: boolean;
  muteCount: number;
}): string {
  if (!input.screeningEnabled) return "Not screening calls";
  if (input.rejectAll) return "Reject all calls";

  const parts: string[] = [];
  if (input.rejectUnknown) parts.push("Reject unknown");
  if (input.muteUnknown) parts.push("Mute unknown");
  if (input.muteCount > 0) {
    parts.push(`Mute ${input.muteCount} number${input.muteCount === 1 ? "" : "s"}`);
  }
  if (parts.length === 0) return "Not rejecting or muting";
  return parts.join(" · ");
}
