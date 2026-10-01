import { type FormEvent, useEffect, useMemo, useState } from "react";
import {
  BellOff,
  Github,
  PhoneIncoming,
  PhoneOff,
  Plus,
  Shield,
  Trash2,
  UserRound,
  VolumeX,
} from "lucide-react";
import { IncomingCall } from "@/components/incoming-call";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  type CallKind,
  MUTE_LIMIT,
  describeMode,
  formatNumber,
  isPrivateNumber,
  numbersMatch,
  screenCall,
} from "@/lib/screening";
import { useCallStore } from "@/store/call-store";

type TestSource = CallKind | "muted";

function TelegramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M21.5 3.6 3.9 10.4c-1.2.5-1.2 1.2-.2 1.5l4.5 1.4 10.4-6.6c.5-.3.9-.1.6.2l-8.4 7.6-.3 4.5c.5 0 .7-.2 1-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.9-1.4z"
      />
    </svg>
  );
}

export function CallApp() {
  const store = useCallStore();
  const [muteDraft, setMuteDraft] = useState("");
  const [muteError, setMuteError] = useState<string | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [contactError, setContactError] = useState<string | null>(null);
  const [testKind, setTestKind] = useState<TestSource>("unknown");
  const [testContactId, setTestContactId] = useState(store.contacts[0]?.id ?? "");
  const [customNumber, setCustomNumber] = useState("");
  const [banner, setBanner] = useState<string | null>(null);

  useEffect(() => {
    void Promise.resolve(useCallStore.persist.rehydrate()).then(() => {
      useCallStore.getState().setHydrated();
    });
  }, []);

  useEffect(() => {
    if (!store.lastToast) return;
    setBanner(store.lastToast);
    const t = window.setTimeout(() => {
      setBanner(null);
      useCallStore.getState().clearToast();
    }, 2200);
    return () => window.clearTimeout(t);
  }, [store.lastToast]);

  useEffect(() => {
    if (!testContactId && store.contacts[0]) setTestContactId(store.contacts[0].id);
  }, [store.contacts, testContactId]);

  const mode = useMemo(
    () =>
      describeMode({
        screeningEnabled: store.screeningEnabled,
        rejectAll: store.rejectAll,
        rejectUnknown: store.rejectUnknown,
        muteUnknown: store.muteUnknown,
        muteCount: store.muteList.length,
      }),
    [store.screeningEnabled, store.rejectAll, store.rejectUnknown, store.muteUnknown, store.muteList.length],
  );

  const locked = !store.screeningEnabled;

  const simulateIncoming = () => {
    let number = "";
    let name: string | null = null;
    let kind: CallKind = "unknown";

    if (testKind === "private") {
      number = "private";
      kind = "private";
    } else if (testKind === "muted") {
      const muted = store.muteList[0];
      if (!muted) {
        setBanner("Add a muted number first");
        return;
      }
      number = muted.number;
      const known = store.contacts.find((c) => numbersMatch(c.number, number));
      name = known?.name ?? null;
      kind = known ? "contact" : "unknown";
    } else if (testKind === "contact") {
      const contact = store.contacts.find((c) => c.id === testContactId) ?? store.contacts[0];
      if (!contact) {
        setBanner("Add a contact first");
        return;
      }
      number = contact.number;
      name = contact.name;
      kind = "contact";
    } else if (customNumber.trim()) {
      number = customNumber.trim();
      const known = store.contacts.find((c) => numbersMatch(c.number, number));
      name = known?.name ?? null;
      kind = known ? "contact" : isPrivateNumber(number) ? "private" : "unknown";
    } else {
      number = "+919000000123";
      kind = "unknown";
    }

    const decision = screenCall({
      screeningEnabled: store.screeningEnabled,
      rejectAll: store.rejectAll,
      rejectUnknown: store.rejectUnknown,
      muteUnknown: store.muteUnknown,
      muteList: store.muteList.map((m) => m.number),
      contacts: store.contacts.map((c) => c.number),
      number,
    });

    if (decision === "reject") {
      store.pushLog({ number, name, kind, decision });
      setBanner(`Rejected ${name ?? formatNumber(number)}`);
      return;
    }

    store.setIncoming({ number, name, kind, decision });
  };

  const addMuted = (event: FormEvent) => {
    event.preventDefault();
    const err = store.addMuteNumber(muteDraft);
    setMuteError(err);
    if (!err) setMuteDraft("");
  };

  const addContact = (event: FormEvent) => {
    event.preventDefault();
    const err = store.addContact(contactName, contactNumber);
    setContactError(err);
    if (!err) {
      setContactName("");
      setContactNumber("");
    }
  };

  return (
    <div className="relative mx-auto min-h-dvh w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6">
      <IncomingCall />

      {banner ? (
        <div className="fixed inset-x-0 top-4 z-40 flex justify-center px-4">
          <p className="rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-lg">
            {banner}
          </p>
        </div>
      ) : null}

      <header className="flex items-start gap-3">
        <img
          src="/app-icon.png"
          alt=""
          width={48}
          height={48}
          className="size-12 rounded-2xl border border-border"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-subtle">Call screening</p>
          <h1 className="text-balance text-2xl font-semibold tracking-tight text-foreground">Call Rejector</h1>
        </div>
        <Badge tone={store.screeningEnabled ? "ok" : "neutral"}>
          {store.screeningEnabled ? "Screening on" : "Off"}
        </Badge>
      </header>

      <div className="mt-5 grid items-start gap-4 lg:grid-cols-2">
      <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-4">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-subtle">Status</p>
        <p className="mt-2 text-base font-medium text-foreground">{mode}</p>
        <p className="mt-1 text-pretty text-sm text-muted-foreground">
          {store.screeningEnabled
            ? store.rejectAll
              ? "Every incoming call is cut before it rings."
              : "Saved contacts can still ring unless you mute them specifically."
            : "Turn on call screening to reject or mute incoming calls."}
        </p>
        <Button
          className="mt-4 w-full"
          variant={store.screeningEnabled ? "secondary" : "default"}
          onClick={() => store.setScreeningEnabled(!store.screeningEnabled)}
        >
          <Shield className="size-4" strokeWidth={2} />
          {store.screeningEnabled ? "Disable call screening" : "Enable call screening"}
        </Button>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-foreground">
          <PhoneOff className="size-4 text-primary" strokeWidth={2} />
          <h2 className="text-sm font-semibold">Reject</h2>
        </div>

        <SettingRow
          title="Reject all calls"
          description={store.rejectAll ? "All incoming calls will be rejected" : "Reject all is off"}
          checked={store.rejectAll}
          disabled={locked}
          onCheckedChange={store.setRejectAll}
        />
        <div className="my-3 h-px bg-border" />
        <SettingRow
          title="Reject unknown only"
          description={
            store.rejectUnknown
              ? "Unknown numbers will be rejected"
              : "Unknown block is off · saved contacts can still ring"
          }
          checked={store.rejectUnknown}
          disabled={locked || store.rejectAll}
          onCheckedChange={store.setRejectUnknown}
        />
      </section>

      <section className="rounded-2xl border border-mute/25 bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-foreground">
            <VolumeX className="size-4 text-mute" strokeWidth={2} />
            <h2 className="text-sm font-semibold">Mute</h2>
          </div>
          <Badge tone="mute">
            {store.muteList.length}/{MUTE_LIMIT}
          </Badge>
        </div>
        <p className="mt-2 text-pretty text-sm text-muted-foreground">
          Mute keeps the call on-screen but kills the ringtone. Reject still wins if both apply.
        </p>

        <SettingRow
          title="Mute all unknown numbers"
          description={store.muteUnknown ? "Unknown numbers will ring silently" : "Unknown mute is off"}
          checked={store.muteUnknown}
          disabled={locked || store.rejectAll}
          onCheckedChange={store.setMuteUnknown}
        />

        <div className="my-3 h-px bg-border" />

        <div className="flex items-center gap-2">
          <BellOff className="size-4 text-mute" strokeWidth={2} />
          <h3 className="text-sm font-semibold text-foreground">Mute selected numbers</h3>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Add up to {MUTE_LIMIT} numbers. These stay silent even if they are saved contacts.
        </p>

        <form onSubmit={addMuted} className="mt-3 flex gap-2">
          <Input
            inputMode="tel"
            autoComplete="tel"
            placeholder="+91 98xxx xxxxx"
            value={muteDraft}
            disabled={locked || store.rejectAll || store.muteList.length >= MUTE_LIMIT}
            onChange={(e) => {
              setMuteDraft(e.target.value);
              setMuteError(null);
            }}
            aria-label="Number to mute"
          />
          <Button
            type="submit"
            variant="secondary"
            disabled={locked || store.rejectAll || store.muteList.length >= MUTE_LIMIT}
            className="shrink-0"
          >
            <Plus className="size-4" strokeWidth={2} />
            Mute
          </Button>
        </form>
        {muteError ? <p className="mt-2 text-sm text-primary">{muteError}</p> : null}

        {store.muteList.length === 0 ? (
          <p className="mt-4 rounded-xl border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
            No muted numbers yet. Add one to silence that caller.
          </p>
        ) : (
          <ul className="mt-3 space-y-2">
            {store.muteList.map((entry) => (
              <li
                key={entry.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-secondary px-3 py-2.5"
              >
                <VolumeX className="size-4 shrink-0 text-mute" strokeWidth={2} />
                <span className="min-w-0 flex-1 font-mono text-sm text-foreground">
                  {formatNumber(entry.number)}
                </span>
                <button
                  type="button"
                  className="inline-flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground"
                  onClick={() => store.removeMuteNumber(entry.id)}
                  aria-label={`Remove ${entry.number} from mute list`}
                >
                  <Trash2 className="size-4" strokeWidth={2} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
      </div>

      <div className="space-y-4">
      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <PhoneIncoming className="size-4 text-foreground" strokeWidth={2} />
          <h2 className="text-sm font-semibold text-foreground">Test an incoming call</h2>
        </div>
        <p className="mt-1 text-pretty text-sm text-muted-foreground">
          Try the rules live. Rejected calls never ring. Muted calls appear without sound.
        </p>

        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {(
            [
              ["contact", "Contact"],
              ["unknown", "Unknown"],
              ["private", "Private"],
              ["muted", "Muted list"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setTestKind(value)}
              className={`h-11 rounded-lg border text-sm font-medium transition-colors duration-[var(--motion-quick)] ${
                testKind === value
                  ? "border-foreground/20 bg-secondary text-foreground"
                  : "border-border bg-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {testKind === "contact" ? (
          <label className="mt-3 block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">Saved contact</span>
            <select
              className="h-11 w-full rounded-lg border border-border bg-secondary px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
              value={testContactId}
              onChange={(e) => setTestContactId(e.target.value)}
            >
              {store.contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} · {formatNumber(c.number)}
                </option>
              ))}
            </select>
          </label>
        ) : testKind === "unknown" ? (
          <label className="mt-3 block">
            <span className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Custom unknown number (optional)
            </span>
            <Input
              inputMode="tel"
              placeholder="+91 90000 00123"
              value={customNumber}
              onChange={(e) => setCustomNumber(e.target.value)}
            />
          </label>
        ) : null}

        <Button className="mt-4 w-full" variant="secondary" onClick={simulateIncoming}>
          <PhoneIncoming className="size-4" strokeWidth={2} />
          Simulate incoming call
        </Button>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center gap-2">
          <UserRound className="size-4 text-foreground" strokeWidth={2} />
          <h2 className="text-sm font-semibold text-foreground">Contacts</h2>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Numbers here count as known. Everyone else is unknown.
        </p>
        <form onSubmit={addContact} className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Input
            placeholder="Name"
            value={contactName}
            onChange={(e) => {
              setContactName(e.target.value);
              setContactError(null);
            }}
            aria-label="Contact name"
          />
          <Input
            inputMode="tel"
            placeholder="Number"
            value={contactNumber}
            onChange={(e) => {
              setContactNumber(e.target.value);
              setContactError(null);
            }}
            aria-label="Contact number"
          />
          <Button type="submit" variant="secondary" className="sm:w-auto">
            <Plus className="size-4" strokeWidth={2} />
            Add
          </Button>
        </form>
        {contactError ? <p className="mt-2 text-sm text-primary">{contactError}</p> : null}
        <ul className="mt-3 space-y-2">
          {store.contacts.map((c) => (
            <li
              key={c.id}
              className="flex items-center gap-3 rounded-xl border border-border bg-secondary px-3 py-2.5"
            >
              <span className="flex size-9 items-center justify-center rounded-full bg-card text-sm font-medium text-foreground">
                {c.name.slice(0, 1)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-foreground">{c.name}</span>
                <span className="block font-mono text-xs text-muted-foreground">{formatNumber(c.number)}</span>
              </span>
              <button
                type="button"
                className="inline-flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground"
                onClick={() => store.removeContact(c.id)}
                aria-label={`Remove ${c.name}`}
              >
                <Trash2 className="size-4" strokeWidth={2} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-foreground">Call log</h2>
          {store.log.length > 0 ? (
            <button
              type="button"
              className="h-11 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
              onClick={store.clearLog}
            >
              Clear
            </button>
          ) : null}
        </div>
        {store.log.length === 0 ? (
          <p className="mt-3 text-sm text-muted-foreground">No calls yet. Run a test incoming call.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {store.log.map((entry) => (
              <li key={entry.id} className="flex items-center gap-3 rounded-xl border border-border bg-secondary px-3 py-2.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {entry.name ?? (entry.kind === "private" ? "Private number" : "Unknown")}
                  </span>
                  <span className="block font-mono text-xs text-muted-foreground">
                    {formatNumber(entry.number)}
                  </span>
                </span>
                <DecisionBadge decision={entry.decision} />
              </li>
            ))}
          </ul>
        )}
      </section>
      </div>
      </div>

      <footer className="mt-8 flex flex-col items-center gap-3 text-center">
        <div className="flex gap-2">
          <a
            href="https://github.com/vikash8019"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-secondary px-4 text-sm text-foreground hover:bg-card"
          >
            <Github className="size-4" strokeWidth={2} />
            GitHub
          </a>
          <a
            href="https://t.me/pxfierce_08"
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center gap-2 rounded-full border border-border bg-secondary px-4 text-sm text-foreground hover:bg-card"
          >
            <TelegramIcon className="size-4" />
            Telegram
          </a>
        </div>
        <p className="text-xs text-subtle">Made by PxFierce</p>
      </footer>
    </div>
  );
}

function SettingRow({
  title,
  description,
  checked,
  disabled,
  onCheckedChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onCheckedChange: (value: boolean) => void;
}) {
  return (
    <div className="mt-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-pretty text-sm text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} aria-label={title} />
    </div>
  );
}

function DecisionBadge({ decision }: { decision: "allow" | "reject" | "mute" }) {
  if (decision === "reject") return <Badge tone="danger">Rejected</Badge>;
  if (decision === "mute") return <Badge tone="mute">Muted</Badge>;
  return <Badge tone="ok">Rang</Badge>;
}
