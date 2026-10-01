import { useEffect, useMemo } from "react";
import { Phone, PhoneOff, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNumber } from "@/lib/screening";
import { startRingtone } from "@/lib/ringtone";
import { useCallStore } from "@/store/call-store";

export function IncomingCall() {
  const incoming = useCallStore((s) => s.incoming);
  const setIncoming = useCallStore((s) => s.setIncoming);
  const pushLog = useCallStore((s) => s.pushLog);

  const silenced = incoming?.decision === "mute";
  const initial = useMemo(() => {
    if (!incoming) return "?";
    if (incoming.name) return incoming.name.slice(0, 1).toUpperCase();
    return "#";
  }, [incoming]);

  useEffect(() => {
    if (!incoming || silenced) return;
    const handle = startRingtone();
    return () => handle.stop();
  }, [incoming, silenced]);

  useEffect(() => {
    if (!incoming) return;
    const t = window.setTimeout(() => {
      pushLog({
        number: incoming.number,
        name: incoming.name,
        kind: incoming.kind,
        decision: incoming.decision,
      });
      setIncoming(null);
    }, 18000);
    return () => window.clearTimeout(t);
  }, [incoming, pushLog, setIncoming]);

  if (!incoming) return null;

  const finish = (pickedUp: boolean) => {
    pushLog({
      number: incoming.number,
      name: incoming.name,
      kind: incoming.kind,
      decision: pickedUp ? "allow" : incoming.decision,
    });
    setIncoming(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background px-6 py-10">
      <p className="text-center text-xs font-medium uppercase tracking-[0.18em] text-subtle">
        {silenced ? "Incoming · silenced" : "Incoming call"}
      </p>

      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="relative flex size-32 items-center justify-center">
          <span className="ring-pulse absolute size-32 rounded-full border border-primary/35" aria-hidden="true" />
          <span className="ring-pulse absolute size-32 rounded-full border border-primary/20 [animation-delay:400ms]" aria-hidden="true" />
          <span className="relative flex size-28 items-center justify-center rounded-full bg-secondary text-4xl font-semibold text-foreground">
            {initial}
          </span>
        </div>

        <h2 className="mt-8 text-balance text-3xl font-semibold tracking-tight text-foreground">
          {incoming.name ?? (incoming.kind === "private" ? "Private number" : "Unknown")}
        </h2>
        <p className="mt-2 font-mono text-sm text-muted-foreground">{formatNumber(incoming.number)}</p>

        {silenced ? (
          <p className="mt-5 inline-flex items-center gap-1.5 rounded-full border border-mute/30 bg-mute/10 px-3 py-1.5 text-xs text-mute">
            <VolumeX className="size-3.5" strokeWidth={2} />
            Ringtone muted by your rules
          </p>
        ) : null}
      </div>

      <div className="mx-auto grid w-full max-w-sm grid-cols-2 gap-3">
        <Button variant="default" className="h-14 rounded-2xl" onClick={() => finish(false)}>
          <PhoneOff className="size-5" strokeWidth={2} />
          Decline
        </Button>
        <Button variant="accept" className="h-14 rounded-2xl" onClick={() => finish(true)}>
          <Phone className="size-5" strokeWidth={2} />
          Accept
        </Button>
      </div>
    </div>
  );
}
