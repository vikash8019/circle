import { i as __toESM } from "../_runtime.mjs";
import { K as require_react, b as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as Shield, c as PhoneOff, d as BellOff, i as Trash2, l as PhoneIncoming, n as UserRound, o as Plus, s as Phone, t as VolumeX, u as Github } from "../_libs/lucide-react.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-01uvucxe.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[transform,opacity,background-color,color,border-color] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40 active:opacity-90", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:opacity-90",
			secondary: "bg-secondary text-secondary-foreground border border-border hover:bg-card",
			outline: "border border-border bg-transparent text-foreground hover:bg-secondary",
			ghost: "text-muted-foreground hover:bg-secondary hover:text-foreground",
			danger: "bg-primary text-primary-foreground hover:opacity-90",
			accept: "bg-ok text-ok-foreground hover:opacity-90"
		},
		size: {
			default: "h-11 px-4",
			sm: "h-9 px-3 text-xs",
			lg: "h-12 px-5",
			icon: "size-11"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
var Button = (0, import_react.forwardRef)(({ className, variant, size, type = "button", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
	ref,
	type,
	className: cn(buttonVariants({
		variant,
		size
	}), className),
	...props
}));
Button.displayName = "Button";
function digitsOf(value) {
	return value.replace(/\D/g, "");
}
function normalizeNumber(value) {
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
function numbersMatch(a, b) {
	const da = digitsOf(a);
	const db = digitsOf(b);
	if (!da || !db) return false;
	if (da === db) return true;
	const ta = da.slice(-10);
	const tb = db.slice(-10);
	return ta.length >= 8 && ta === tb;
}
function isPrivateNumber(value) {
	const raw = value.trim().toLowerCase();
	if (!raw) return true;
	return raw === "private" || raw === "unknown" || raw === "restricted" || raw === "hidden";
}
function inNumberList(number, list) {
	if (isPrivateNumber(number)) return false;
	return list.some((item) => numbersMatch(number, item));
}
function formatNumber(value) {
	if (isPrivateNumber(value)) return "Private number";
	const digits = digitsOf(value);
	if (digits.length === 12 && digits.startsWith("91")) return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
	if (digits.length === 10) return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
	if (value.startsWith("+") && digits.length > 6) return `+${digits.slice(0, digits.length - 10)} ${digits.slice(-10, -5)} ${digits.slice(-5)}`.replace(/\s+/g, " ").trim();
	return value.trim();
}
function screenCall(input) {
	if (!input.screeningEnabled) return "allow";
	if (input.rejectAll) return "reject";
	const privateCaller = isPrivateNumber(input.number);
	if (!privateCaller && inNumberList(input.number, input.muteList)) return "mute";
	const known = !privateCaller && inNumberList(input.number, input.contacts);
	if (!known && input.rejectUnknown) return "reject";
	if (!known && input.muteUnknown) return "mute";
	return "allow";
}
function describeMode(input) {
	if (!input.screeningEnabled) return "Not screening calls";
	if (input.rejectAll) return "Reject all calls";
	const parts = [];
	if (input.rejectUnknown) parts.push("Reject unknown");
	if (input.muteUnknown) parts.push("Mute unknown");
	if (input.muteCount > 0) parts.push(`Mute ${input.muteCount} number${input.muteCount === 1 ? "" : "s"}`);
	if (parts.length === 0) return "Not rejecting or muting";
	return parts.join(" · ");
}
function startRingtone() {
	if (typeof window === "undefined") return { stop: () => {} };
	const AudioCtx = window.AudioContext || window.webkitAudioContext;
	if (!AudioCtx) return { stop: () => {} };
	const ctx = new AudioCtx();
	const master = ctx.createGain();
	master.gain.value = .08;
	master.connect(ctx.destination);
	let stopped = false;
	const oscs = [];
	const chirp = (when) => {
		for (const freq of [440, 480]) {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = "sine";
			osc.frequency.value = freq;
			gain.gain.setValueAtTime(1e-4, when);
			gain.gain.exponentialRampToValueAtTime(.7, when + .02);
			gain.gain.setValueAtTime(.7, when + .38);
			gain.gain.exponentialRampToValueAtTime(1e-4, when + .42);
			osc.connect(gain);
			gain.connect(master);
			osc.start(when);
			osc.stop(when + .45);
			oscs.push(osc);
		}
	};
	const loop = () => {
		if (stopped) return;
		const now = ctx.currentTime;
		chirp(now);
		chirp(now + .5);
		timer = window.setTimeout(loop, 2e3);
	};
	let timer = window.setTimeout(loop, 0);
	ctx.resume();
	return { stop: () => {
		stopped = true;
		window.clearTimeout(timer);
		for (const osc of oscs) try {
			osc.stop();
		} catch {}
		ctx.close();
	} };
}
function uid() {
	if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
	return `id-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
var defaultContacts = [
	{
		id: "c-mom",
		name: "Mom",
		number: "+919811111111"
	},
	{
		id: "c-rahul",
		name: "Rahul",
		number: "+919822222222"
	},
	{
		id: "c-office",
		name: "Office",
		number: "+911140012345"
	}
];
var useCallStore = create()(persist((set, get) => ({
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
	setRejectAll: (value) => set({
		rejectAll: value,
		lastToast: value ? "All incoming calls will be rejected" : "Reject all is off"
	}),
	setRejectUnknown: (value) => set({
		rejectUnknown: value,
		lastToast: value ? "Unknown numbers will be rejected" : "Unknown block is off"
	}),
	setMuteUnknown: (value) => set({
		muteUnknown: value,
		lastToast: value ? "Unknown numbers will ring silently" : "Unknown mute is off"
	}),
	addContact: (name, number) => {
		const normalized = normalizeNumber(number);
		if (digitsOf(normalized).length < 8) return "Enter a valid phone number";
		const label = name.trim() || "Contact";
		if (get().contacts.some((c) => numbersMatch(c.number, normalized))) return "This number is already in contacts";
		set({ contacts: [{
			id: uid(),
			name: label,
			number: normalized
		}, ...get().contacts] });
		return null;
	},
	removeContact: (id) => set({ contacts: get().contacts.filter((c) => c.id !== id) }),
	addMuteNumber: (number) => {
		const normalized = normalizeNumber(number);
		if (digitsOf(normalized).length < 8) return "Enter a valid phone number";
		const { muteList } = get();
		if (muteList.length >= 20) return `Mute list is limited to 20 numbers`;
		if (muteList.some((m) => numbersMatch(m.number, normalized))) return "This number is already muted";
		set({
			muteList: [{
				id: uid(),
				number: normalized,
				addedAt: Date.now()
			}, ...muteList],
			lastToast: `${normalized} will ring silently`
		});
		return null;
	},
	removeMuteNumber: (id) => set({ muteList: get().muteList.filter((m) => m.id !== id) }),
	pushLog: (entry) => set({ log: [{
		id: uid(),
		at: Date.now(),
		...entry
	}, ...get().log].slice(0, 40) }),
	setIncoming: (call) => set({ incoming: call }),
	clearToast: () => set({ lastToast: null }),
	clearLog: () => set({ log: [] })
}), {
	name: "call-rejector-v1",
	skipHydration: true,
	partialize: (state) => ({
		screeningEnabled: state.screeningEnabled,
		rejectAll: state.rejectAll,
		rejectUnknown: state.rejectUnknown,
		muteUnknown: state.muteUnknown,
		contacts: state.contacts,
		muteList: state.muteList,
		log: state.log
	})
}));
function IncomingCall() {
	const incoming = useCallStore((s) => s.incoming);
	const setIncoming = useCallStore((s) => s.setIncoming);
	const pushLog = useCallStore((s) => s.pushLog);
	const silenced = incoming?.decision === "mute";
	const initial = (0, import_react.useMemo)(() => {
		if (!incoming) return "?";
		if (incoming.name) return incoming.name.slice(0, 1).toUpperCase();
		return "#";
	}, [incoming]);
	(0, import_react.useEffect)(() => {
		if (!incoming || silenced) return;
		const handle = startRingtone();
		return () => handle.stop();
	}, [incoming, silenced]);
	(0, import_react.useEffect)(() => {
		if (!incoming) return;
		const t = window.setTimeout(() => {
			pushLog({
				number: incoming.number,
				name: incoming.name,
				kind: incoming.kind,
				decision: incoming.decision
			});
			setIncoming(null);
		}, 18e3);
		return () => window.clearTimeout(t);
	}, [
		incoming,
		pushLog,
		setIncoming
	]);
	if (!incoming) return null;
	const finish = (pickedUp) => {
		pushLog({
			number: incoming.number,
			name: incoming.name,
			kind: incoming.kind,
			decision: pickedUp ? "allow" : incoming.decision
		});
		setIncoming(null);
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "fixed inset-0 z-50 flex flex-col bg-background px-6 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center text-xs font-medium uppercase tracking-[0.18em] text-subtle",
				children: silenced ? "Incoming · silenced" : "Incoming call"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-1 flex-col items-center justify-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "relative flex size-32 items-center justify-center",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ring-pulse absolute size-32 rounded-full border border-primary/35",
								"aria-hidden": "true"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "ring-pulse absolute size-32 rounded-full border border-primary/20 [animation-delay:400ms]",
								"aria-hidden": "true"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "relative flex size-28 items-center justify-center rounded-full bg-secondary text-4xl font-semibold text-foreground",
								children: initial
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-8 text-balance text-3xl font-semibold tracking-tight text-foreground",
						children: incoming.name ?? (incoming.kind === "private" ? "Private number" : "Unknown")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 font-mono text-sm text-muted-foreground",
						children: formatNumber(incoming.number)
					}),
					silenced ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-5 inline-flex items-center gap-1.5 rounded-full border border-mute/30 bg-mute/10 px-3 py-1.5 text-xs text-mute",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, {
							className: "size-3.5",
							strokeWidth: 2
						}), "Ringtone muted by your rules"]
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mx-auto grid w-full max-w-sm grid-cols-2 gap-3",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "default",
					className: "h-14 rounded-2xl",
					onClick: () => finish(false),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneOff, {
						className: "size-5",
						strokeWidth: 2
					}), "Decline"]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
					variant: "accept",
					className: "h-14 rounded-2xl",
					onClick: () => finish(true),
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Phone, {
						className: "size-5",
						strokeWidth: 2
					}), "Accept"]
				})]
			})
		]
	});
}
function Badge({ className, tone = "neutral", children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: cn("inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium", tone === "neutral" && "border-border bg-secondary text-muted-foreground", tone === "danger" && "border-primary/30 bg-primary/15 text-primary", tone === "mute" && "border-mute/30 bg-mute/15 text-mute", tone === "ok" && "border-ok/30 bg-ok/15 text-ok", className),
		children
	});
}
var Input = (0, import_react.forwardRef)(({ className, type = "text", ...props }, ref) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
	ref,
	type,
	className: cn("flex h-11 w-full rounded-lg border border-border bg-secondary px-3 text-sm text-foreground placeholder:text-subtle outline-none transition-[border-color,box-shadow] duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:ring-2 focus-visible:ring-ring", className),
	...props
}));
Input.displayName = "Input";
function Switch({ checked, onCheckedChange, disabled, className, "aria-label": ariaLabel }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		role: "switch",
		"aria-checked": checked,
		"aria-label": ariaLabel,
		disabled,
		onClick: () => onCheckedChange(!checked),
		className: cn("relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border border-transparent bg-secondary transition-colors duration-[var(--motion-quick)] ease-[var(--ease-out)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40", checked && "bg-primary", className),
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { className: cn("pointer-events-none block size-6 rounded-full bg-foreground shadow-sm transition-transform duration-[var(--motion-quick)] ease-[var(--ease-out)]", checked ? "translate-x-5 bg-primary-foreground" : "translate-x-0.5") })
	});
}
function TelegramIcon({ className }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("svg", {
		viewBox: "0 0 24 24",
		className,
		"aria-hidden": "true",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			fill: "currentColor",
			d: "M21.5 3.6 3.9 10.4c-1.2.5-1.2 1.2-.2 1.5l4.5 1.4 10.4-6.6c.5-.3.9-.1.6.2l-8.4 7.6-.3 4.5c.5 0 .7-.2 1-.5l2.3-2.2 4.8 3.5c.9.5 1.5.2 1.7-.8l3.1-14.6c.3-1.3-.5-1.9-1.9-1.4z"
		})
	});
}
function CallApp() {
	const store = useCallStore();
	const [muteDraft, setMuteDraft] = (0, import_react.useState)("");
	const [muteError, setMuteError] = (0, import_react.useState)(null);
	const [contactName, setContactName] = (0, import_react.useState)("");
	const [contactNumber, setContactNumber] = (0, import_react.useState)("");
	const [contactError, setContactError] = (0, import_react.useState)(null);
	const [testKind, setTestKind] = (0, import_react.useState)("unknown");
	const [testContactId, setTestContactId] = (0, import_react.useState)(store.contacts[0]?.id ?? "");
	const [customNumber, setCustomNumber] = (0, import_react.useState)("");
	const [banner, setBanner] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		Promise.resolve(useCallStore.persist.rehydrate()).then(() => {
			useCallStore.getState().setHydrated();
		});
	}, []);
	(0, import_react.useEffect)(() => {
		if (!store.lastToast) return;
		setBanner(store.lastToast);
		const t = window.setTimeout(() => {
			setBanner(null);
			useCallStore.getState().clearToast();
		}, 2200);
		return () => window.clearTimeout(t);
	}, [store.lastToast]);
	(0, import_react.useEffect)(() => {
		if (!testContactId && store.contacts[0]) setTestContactId(store.contacts[0].id);
	}, [store.contacts, testContactId]);
	const mode = (0, import_react.useMemo)(() => describeMode({
		screeningEnabled: store.screeningEnabled,
		rejectAll: store.rejectAll,
		rejectUnknown: store.rejectUnknown,
		muteUnknown: store.muteUnknown,
		muteCount: store.muteList.length
	}), [
		store.screeningEnabled,
		store.rejectAll,
		store.rejectUnknown,
		store.muteUnknown,
		store.muteList.length
	]);
	const locked = !store.screeningEnabled;
	const simulateIncoming = () => {
		let number = "";
		let name = null;
		let kind = "unknown";
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
			number
		});
		if (decision === "reject") {
			store.pushLog({
				number,
				name,
				kind,
				decision
			});
			setBanner(`Rejected ${name ?? formatNumber(number)}`);
			return;
		}
		store.setIncoming({
			number,
			name,
			kind,
			decision
		});
	};
	const addMuted = (event) => {
		event.preventDefault();
		const err = store.addMuteNumber(muteDraft);
		setMuteError(err);
		if (!err) setMuteDraft("");
	};
	const addContact = (event) => {
		event.preventDefault();
		const err = store.addContact(contactName, contactNumber);
		setContactError(err);
		if (!err) {
			setContactName("");
			setContactNumber("");
		}
	};
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "relative mx-auto min-h-dvh w-full max-w-5xl px-4 pb-16 pt-6 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(IncomingCall, {}),
			banner ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-x-0 top-4 z-40 flex justify-center px-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "rounded-full border border-border bg-card px-4 py-2 text-sm text-foreground shadow-lg",
					children: banner
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex items-start gap-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/app-icon.png",
						alt: "",
						width: 48,
						height: 48,
						className: "size-12 rounded-2xl border border-border"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0 flex-1",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs font-medium uppercase tracking-[0.18em] text-subtle",
							children: "Call screening"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
							className: "text-balance text-2xl font-semibold tracking-tight text-foreground",
							children: "Call Rejector"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
						tone: store.screeningEnabled ? "ok" : "neutral",
						children: store.screeningEnabled ? "Screening on" : "Off"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid items-start gap-4 lg:grid-cols-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-2xl border border-border bg-card p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-xs font-medium uppercase tracking-[0.16em] text-subtle",
									children: "Status"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-base font-medium text-foreground",
									children: mode
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-pretty text-sm text-muted-foreground",
									children: store.screeningEnabled ? store.rejectAll ? "Every incoming call is cut before it rings." : "Saved contacts can still ring unless you mute them specifically." : "Turn on call screening to reject or mute incoming calls."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									className: "mt-4 w-full",
									variant: store.screeningEnabled ? "secondary" : "default",
									onClick: () => store.setScreeningEnabled(!store.screeningEnabled),
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Shield, {
										className: "size-4",
										strokeWidth: 2
									}), store.screeningEnabled ? "Disable call screening" : "Enable call screening"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-2xl border border-border bg-card p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2 text-foreground",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneOff, {
										className: "size-4 text-primary",
										strokeWidth: 2
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-sm font-semibold",
										children: "Reject"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
									title: "Reject all calls",
									description: store.rejectAll ? "All incoming calls will be rejected" : "Reject all is off",
									checked: store.rejectAll,
									disabled: locked,
									onCheckedChange: store.setRejectAll
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-3 h-px bg-border" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
									title: "Reject unknown only",
									description: store.rejectUnknown ? "Unknown numbers will be rejected" : "Unknown block is off · saved contacts can still ring",
									checked: store.rejectUnknown,
									disabled: locked || store.rejectAll,
									onCheckedChange: store.setRejectUnknown
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-2xl border border-mute/25 bg-card p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center justify-between gap-3",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "flex items-center gap-2 text-foreground",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, {
											className: "size-4 text-mute",
											strokeWidth: 2
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
											className: "text-sm font-semibold",
											children: "Mute"
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Badge, {
										tone: "mute",
										children: [
											store.muteList.length,
											"/",
											20
										]
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-pretty text-sm text-muted-foreground",
									children: "Mute keeps the call on-screen but kills the ringtone. Reject still wins if both apply."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingRow, {
									title: "Mute all unknown numbers",
									description: store.muteUnknown ? "Unknown numbers will ring silently" : "Unknown mute is off",
									checked: store.muteUnknown,
									disabled: locked || store.rejectAll,
									onCheckedChange: store.setMuteUnknown
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "my-3 h-px bg-border" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BellOff, {
										className: "size-4 text-mute",
										strokeWidth: 2
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
										className: "text-sm font-semibold text-foreground",
										children: "Mute selected numbers"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: [
										"Add up to ",
										20,
										" numbers. These stay silent even if they are saved contacts."
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									onSubmit: addMuted,
									className: "mt-3 flex gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										inputMode: "tel",
										autoComplete: "tel",
										placeholder: "+91 98xxx xxxxx",
										value: muteDraft,
										disabled: locked || store.rejectAll || store.muteList.length >= 20,
										onChange: (e) => {
											setMuteDraft(e.target.value);
											setMuteError(null);
										},
										"aria-label": "Number to mute"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
										type: "submit",
										variant: "secondary",
										disabled: locked || store.rejectAll || store.muteList.length >= 20,
										className: "shrink-0",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
											className: "size-4",
											strokeWidth: 2
										}), "Mute"]
									})]
								}),
								muteError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-primary",
									children: muteError
								}) : null,
								store.muteList.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-4 rounded-xl border border-dashed border-border px-3 py-4 text-sm text-muted-foreground",
									children: "No muted numbers yet. Add one to silence that caller."
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-3 space-y-2",
									children: store.muteList.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-center gap-3 rounded-xl border border-border bg-secondary px-3 py-2.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)(VolumeX, {
												className: "size-4 shrink-0 text-mute",
												strokeWidth: 2
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "min-w-0 flex-1 font-mono text-sm text-foreground",
												children: formatNumber(entry.number)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "inline-flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground",
												onClick: () => store.removeMuteNumber(entry.id),
												"aria-label": `Remove ${entry.number} from mute list`,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
													className: "size-4",
													strokeWidth: 2
												})
											})
										]
									}, entry.id))
								})
							]
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-4",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-2xl border border-border bg-card p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneIncoming, {
										className: "size-4 text-foreground",
										strokeWidth: 2
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-sm font-semibold text-foreground",
										children: "Test an incoming call"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-pretty text-sm text-muted-foreground",
									children: "Try the rules live. Rejected calls never ring. Muted calls appear without sound."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
									className: "mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4",
									children: [
										["contact", "Contact"],
										["unknown", "Unknown"],
										["private", "Private"],
										["muted", "Muted list"]
									].map(([value, label]) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
										type: "button",
										onClick: () => setTestKind(value),
										className: `h-11 rounded-lg border text-sm font-medium transition-colors duration-[var(--motion-quick)] ${testKind === value ? "border-foreground/20 bg-secondary text-foreground" : "border-border bg-transparent text-muted-foreground hover:text-foreground"}`,
										children: label
									}, value))
								}),
								testKind === "contact" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "mt-3 block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mb-1.5 block text-xs font-medium text-muted-foreground",
										children: "Saved contact"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
										className: "h-11 w-full rounded-lg border border-border bg-secondary px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring",
										value: testContactId,
										onChange: (e) => setTestContactId(e.target.value),
										children: store.contacts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("option", {
											value: c.id,
											children: [
												c.name,
												" · ",
												formatNumber(c.number)
											]
										}, c.id))
									})]
								}) : testKind === "unknown" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "mt-3 block",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "mb-1.5 block text-xs font-medium text-muted-foreground",
										children: "Custom unknown number (optional)"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
										inputMode: "tel",
										placeholder: "+91 90000 00123",
										value: customNumber,
										onChange: (e) => setCustomNumber(e.target.value)
									})]
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
									className: "mt-4 w-full",
									variant: "secondary",
									onClick: simulateIncoming,
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PhoneIncoming, {
										className: "size-4",
										strokeWidth: 2
									}), "Simulate incoming call"]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-2xl border border-border bg-card p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex items-center gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserRound, {
										className: "size-4 text-foreground",
										strokeWidth: 2
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
										className: "text-sm font-semibold text-foreground",
										children: "Contacts"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-1 text-sm text-muted-foreground",
									children: "Numbers here count as known. Everyone else is unknown."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									onSubmit: addContact,
									className: "mt-3 flex flex-col gap-2 sm:flex-row",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											placeholder: "Name",
											value: contactName,
											onChange: (e) => {
												setContactName(e.target.value);
												setContactError(null);
											},
											"aria-label": "Contact name"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
											inputMode: "tel",
											placeholder: "Number",
											value: contactNumber,
											onChange: (e) => {
												setContactNumber(e.target.value);
												setContactError(null);
											},
											"aria-label": "Contact number"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
											type: "submit",
											variant: "secondary",
											className: "sm:w-auto",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Plus, {
												className: "size-4",
												strokeWidth: 2
											}), "Add"]
										})
									]
								}),
								contactError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-primary",
									children: contactError
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-3 space-y-2",
									children: store.contacts.map((c) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
										className: "flex items-center gap-3 rounded-xl border border-border bg-secondary px-3 py-2.5",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "flex size-9 items-center justify-center rounded-full bg-card text-sm font-medium text-foreground",
												children: c.name.slice(0, 1)
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "min-w-0 flex-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block truncate text-sm font-medium text-foreground",
													children: c.name
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "block font-mono text-xs text-muted-foreground",
													children: formatNumber(c.number)
												})]
											}),
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
												type: "button",
												className: "inline-flex size-11 items-center justify-center rounded-lg text-muted-foreground hover:bg-card hover:text-foreground",
												onClick: () => store.removeContact(c.id),
												"aria-label": `Remove ${c.name}`,
												children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, {
													className: "size-4",
													strokeWidth: 2
												})
											})
										]
									}, c.id))
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
							className: "rounded-2xl border border-border bg-card p-4",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex items-center justify-between gap-3",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "text-sm font-semibold text-foreground",
									children: "Call log"
								}), store.log.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									className: "h-11 px-2 text-xs font-medium text-muted-foreground hover:text-foreground",
									onClick: store.clearLog,
									children: "Clear"
								}) : null]
							}), store.log.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted-foreground",
								children: "No calls yet. Run a test incoming call."
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 space-y-2",
								children: store.log.map((entry) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "flex items-center gap-3 rounded-xl border border-border bg-secondary px-3 py-2.5",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
										className: "min-w-0 flex-1",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block truncate text-sm font-medium text-foreground",
											children: entry.name ?? (entry.kind === "private" ? "Private number" : "Unknown")
										}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "block font-mono text-xs text-muted-foreground",
											children: formatNumber(entry.number)
										})]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DecisionBadge, { decision: entry.decision })]
								}, entry.id))
							})]
						})
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("footer", {
				className: "mt-8 flex flex-col items-center gap-3 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "https://github.com/vikash8019",
						target: "_blank",
						rel: "noreferrer",
						className: "inline-flex h-11 items-center gap-2 rounded-full border border-border bg-secondary px-4 text-sm text-foreground hover:bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Github, {
							className: "size-4",
							strokeWidth: 2
						}), "GitHub"]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
						href: "https://t.me/pxfierce_08",
						target: "_blank",
						rel: "noreferrer",
						className: "inline-flex h-11 items-center gap-2 rounded-full border border-border bg-secondary px-4 text-sm text-foreground hover:bg-card",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(TelegramIcon, { className: "size-4" }), "Telegram"]
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-xs text-subtle",
					children: "Made by PxFierce"
				})]
			})
		]
	});
}
function SettingRow({ title, description, checked, disabled, onCheckedChange }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mt-4 flex items-start justify-between gap-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "min-w-0",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm font-medium text-foreground",
				children: title
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-0.5 text-pretty text-sm text-muted-foreground",
				children: description
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Switch, {
			checked,
			disabled,
			onCheckedChange,
			"aria-label": title
		})]
	});
}
function DecisionBadge({ decision }) {
	if (decision === "reject") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: "danger",
		children: "Rejected"
	});
	if (decision === "mute") return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: "mute",
		children: "Muted"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Badge, {
		tone: "ok",
		children: "Rang"
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CallApp, {});
}
//#endregion
export { Home as component };
