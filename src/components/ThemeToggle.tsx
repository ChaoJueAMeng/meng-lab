import { useEffect, useId, useRef, useState, type ReactNode, type SVGProps } from 'react';
import { applyTheme, getThemePref, setThemePref, type ThemePref } from '../lib/theme';

const OPTIONS: { id: ThemePref; label: string; icon: ReactNode }[] = [
	{ id: 'light', label: '浅色', icon: <SunIcon /> },
	{ id: 'dark', label: '深色', icon: <MoonIcon /> },
	{ id: 'system', label: '系统', icon: <MonitorIcon /> },
];

export default function ThemeToggle() {
	const [pref, setPref] = useState<ThemePref>('light');
	const [open, setOpen] = useState(false);
	const rootRef = useRef<HTMLDivElement>(null);
	const triggerRef = useRef<HTMLButtonElement>(null);
	const optionRefs = useRef<Partial<Record<ThemePref, HTMLButtonElement>>>({});
	const pendingFocus = useRef<ThemePref | null>(null);
	const prefRef = useRef(pref);
	const menuId = useId();
	const current = OPTIONS.find((option) => option.id === pref) ?? OPTIONS[0];
	prefRef.current = pref;

	useEffect(() => {
		const sync = () => setPref(getThemePref());
		sync();
		applyTheme(getThemePref());

		const media = window.matchMedia('(prefers-color-scheme: dark)');
		const onSystemChange = () => {
			if (getThemePref() === 'system') applyTheme('system');
			sync();
		};
		const observer = new MutationObserver(sync);
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme-pref'] });
		media.addEventListener('change', onSystemChange);
		return () => {
			media.removeEventListener('change', onSystemChange);
			observer.disconnect();
		};
	}, []);

	useEffect(() => {
		if (!open) return;
		const id = pendingFocus.current ?? prefRef.current;
		pendingFocus.current = null;
		optionRefs.current[id]?.focus();
		const onPointerDown = (event: PointerEvent) => {
			if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
		};
		const onKeyDown = (event: KeyboardEvent) => {
			if (event.key !== 'Escape') return;
			setOpen(false);
			triggerRef.current?.focus();
		};
		document.addEventListener('pointerdown', onPointerDown);
		document.addEventListener('keydown', onKeyDown);
		return () => {
			document.removeEventListener('pointerdown', onPointerDown);
			document.removeEventListener('keydown', onKeyDown);
		};
	}, [open]);

	const choose = (id: ThemePref) => {
		setPref(id);
		setThemePref(id);
		setOpen(false);
		triggerRef.current?.focus();
	};

	const moveFocus = (delta: number) => {
		const buttons = OPTIONS.map((option) => optionRefs.current[option.id]);
		const index = buttons.findIndex((button) => button === document.activeElement);
		const start = index === -1 ? OPTIONS.findIndex((option) => option.id === prefRef.current) : index;
		buttons[(start + delta + buttons.length) % buttons.length]?.focus();
	};

	return (
		<div className="theme-toggle" ref={rootRef}>
			<button
				ref={triggerRef}
				type="button"
				className="theme-toggle-trigger"
				aria-haspopup="menu"
				aria-expanded={open}
				aria-controls={menuId}
				aria-label={`主题，当前${current.label}`}
				onClick={() => setOpen((value) => !value)}
				onKeyDown={(event) => {
					if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
					event.preventDefault();
					if (!open) {
						pendingFocus.current = pref;
						setOpen(true);
						return;
					}
					optionRefs.current[pref]?.focus();
				}}
			>
				<span className="theme-icon" data-icon="light">
					<SunIcon />
				</span>
				<span className="theme-icon" data-icon="dark">
					<MoonIcon />
				</span>
				<span className="theme-icon" data-icon="system">
					<MonitorIcon />
				</span>
				<ChevronIcon />
			</button>
			<div id={menuId} className="theme-menu" role="menu" aria-label="主题" hidden={!open}>
				{OPTIONS.map((option) => (
					<button
						key={option.id}
						ref={(node) => {
							if (node) optionRefs.current[option.id] = node;
							else delete optionRefs.current[option.id];
						}}
						type="button"
						role="menuitemradio"
						data-option={option.id}
						aria-checked={pref === option.id}
						aria-label={option.label}
						className={pref === option.id ? 'is-active' : undefined}
						onClick={() => choose(option.id)}
						onKeyDown={(event) => {
							if (event.key === 'ArrowDown') {
								event.preventDefault();
								moveFocus(1);
							} else if (event.key === 'ArrowUp') {
								event.preventDefault();
								moveFocus(-1);
							}
						}}
					>
						{option.icon}
					</button>
				))}
			</div>
		</div>
	);
}

function Icon(props: SVGProps<SVGSVGElement>) {
	return (
		<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props} />
	);
}

function SunIcon() {
	return (
		<Icon>
			<circle cx="12" cy="12" r="3.4" />
			<path d="M12 3.2v1.8M12 19v1.8M4.8 4.8l1.3 1.3M17.9 17.9l1.3 1.3M3.2 12h1.8M19 12h1.8M4.8 19.2l1.3-1.3M17.9 6.1l1.3-1.3" />
		</Icon>
	);
}

function MoonIcon() {
	return (
		<Icon>
			<path d="M20.2 14.6A7.6 7.6 0 1 1 9.4 3.8a6.1 6.1 0 0 0 10.8 10.8z" />
		</Icon>
	);
}

function MonitorIcon() {
	return (
		<Icon>
			<rect x="3" y="4.2" width="18" height="12" rx="1.8" />
			<path d="M8 19.8h8M12 16.2v3.6" />
		</Icon>
	);
}

function ChevronIcon() {
	return (
		<Icon className="theme-chevron" width="14" height="14">
			<path d="M7 10.2 12 15l5-4.8" />
		</Icon>
	);
}
