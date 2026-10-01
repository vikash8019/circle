import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type CallDecision,
  type CallKind,
  MUTE_LIMIT,
  digitsOf,
  normalizeNumber,
  numbersMatch,
} from "@/lib/screening";

export type Contact = {
  id: string;
  name: string;
  number: string;
};

export type MuteEntry = {
  id: string;
  number: string;
  addedAt: number;
};

export type LogEntry = {
  id: string;
  number: string;
  name: string | null;
  kind: CallKind;
  decision: CallDecision;
  at: number;
};

type IncomingCall = {
  number: string;
  name: string | null;
  kind: CallKind;
  decision: CallDecision;
};

type CallState = {
  hydrated: boolean;
  screeningEnabled: boolean;
  rejectAll: boolean;
  rejectUnknown: boolean;
  muteUnknown: boolean;
  contacts: Contact[];
  muteList: MuteEntry[];
  log: LogEntry[];
  incoming: IncomingCall | null;
  lastToast: string | null;
  setHydrated: () => void;
  setScreeningEnabled: (value: boolean) => void;
  setRejectAll: (value: boolean) => void;
  setRejectUnknown: (value: boolean) => void;
  setMuteUnknown: (value: boolean) => void;
  addContact: (name: string, number: string) => string | null;
  removeContact: (id: string) => void;
  addMuteNumber: (number: string) => string | null;
  removeMuteNumber: (id: string) => void;
  pushLog: (entry: Omit<LogEntry, "id" | "at">) => void;
  setIncoming: (call: IncomingCall | null) => void;
  clearToast: () => void;
  clearLog: () => void;
};

function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

const defaultContacts: Contact[] = [
  { id: "c-mom", name: "Mom", number: "+919811111111" },
  { id: "c-rahul", name: "Rahul", number: "+919822222222" },
  { id: "c-office", name: "Office", number: "+911140012345" },
];

export const useCallStore = create<CallState>()(
  persist(
    (set, get) => ({
      hydrated: false,
      screeningEnabled: true,
      rejectAll: false,
      rejectUnknown: false,
      muteUnknown: false,
      contacts: defaultContacts,
      muteList: [],
      log: [],
      incoming: null,
      lastToast: null,
      setHydrated: () => set({ hydrated: true }),
      setScreeningEnabled: (value) => set({ screeningEnabled: value }),
      setRejectAll: (value) => set({ rejectAll: value, lastToast: value ? "All incoming calls will be rejected" : "Reject all is off" }),
      setRejectUnknown: (value) =>
        set({
          rejectUnknown: value,
          lastToast: value ? "Unknown numbers will be rejected" : "Unknown block is off",
        }),
      setMuteUnknown: (value) =>
        set({
          muteUnknown: value,
          lastToast: value ? "Unknown numbers will ring silently" : "Unknown mute is off",
        }),
      addContact: (name, number) => {
        const normalized = normalizeNumber(number);
        if (digitsOf(normalized).length < 8) return "Enter a valid phone number";
        const label = name.trim() || "Contact";
        if (get().contacts.some((c) => numbersMatch(c.number, normalized))) {
          return "This number is already in contacts";
        }
        set({
          contacts: [{ id: uid(), name: label, number: normalized }, ...get().contacts],
        });
        return null;
      },
      removeContact: (id) => set({ contacts: get().contacts.filter((c) => c.id !== id) }),
      addMuteNumber: (number) => {
        const normalized = normalizeNumber(number);
        if (digitsOf(normalized).length < 8) return "Enter a valid phone number";
        const { muteList } = get();
        if (muteList.length >= MUTE_LIMIT) return `Mute list is limited to ${MUTE_LIMIT} numbers`;
        if (muteList.some((m) => numbersMatch(m.number, normalized))) {
          return "This number is already muted";
        }
        set({
          muteList: [{ id: uid(), number: normalized, addedAt: Date.now() }, ...muteList],
          lastToast: `${normalized} will ring silently`,
        });
        return null;
      },
      removeMuteNumber: (id) => set({ muteList: get().muteList.filter((m) => m.id !== id) }),
      pushLog: (entry) =>
        set({
          log: [{ id: uid(), at: Date.now(), ...entry }, ...get().log].slice(0, 40),
        }),
      setIncoming: (call) => set({ incoming: call }),
      clearToast: () => set({ lastToast: null }),
      clearLog: () => set({ log: [] }),
    }),
    {
      name: "call-rejector-v1",
      skipHydration: true,
      partialize: (state) => ({
        screeningEnabled: state.screeningEnabled,
        rejectAll: state.rejectAll,
        rejectUnknown: state.rejectUnknown,
        muteUnknown: state.muteUnknown,
        contacts: state.contacts,
        muteList: state.muteList,
        log: state.log,
      }),
    },
  ),
);
