import { useEffect, useRef, useState } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import DemoStage from './DemoStage';

function band(value: number) {
	if (value >= 80) return 'hot';
	if (value >= 50) return 'warm';
	return 'ok';
}

function Meter() {
	const reduced = useReducedMotion();
	const stageRef = useRef<HTMLDivElement>(null);
	const drag = useRef({ active: false, moved: false, dy: 0, pointer: 0 });
	const point = useRef({ x: 0, y: 48 });
	const leaveTimer = useRef(0);
	const [mem, setMem] = useState(42);
	const [down, setDown] = useState(12.4);
	const [up, setUp] = useState(1.8);
	const [edge, setEdge] = useState<'left' | 'right'>('right');
	const [top, setTop] = useState(48);
	const [floating, setFloating] = useState<{ x: number; y: number } | null>(null);
	const [expanded, setExpanded] = useState(false);
	const [fine, setFine] = useState(true);

	useEffect(() => {
		const media = window.matchMedia('(hover: hover) and (pointer: fine)');
		const sync = () => setFine(media.matches);
		sync();
		media.addEventListener('change', sync);
		return () => media.removeEventListener('change', sync);
	}, []);

	useEffect(() => {
		let timer = 0;
		const tick = () => {
			setMem((value) => Math.min(96, Math.max(18, value + (Math.random() - 0.48) * 7)));
			setDown((value) => Math.max(0.2, value + (Math.random() - 0.42) * 6));
			setUp((value) => Math.max(0.1, value + (Math.random() - 0.48) * 2.4));
		};
		const arm = () => {
			window.clearInterval(timer);
			if (!document.hidden) timer = window.setInterval(tick, 900);
		};
		arm();
		document.addEventListener('visibilitychange', arm);
		return () => {
			window.clearInterval(timer);
			document.removeEventListener('visibilitychange', arm);
		};
	}, []);

	const tone = band(mem);
	const radius = 18;
	const circ = 2 * Math.PI * radius;
	const dash = circ * (1 - Math.min(mem, 100) / 100);

	const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
		const bounds = stageRef.current?.getBoundingClientRect();
		if (!bounds) return;
		drag.current = { active: true, moved: false, dy: event.clientY - bounds.top - top, pointer: event.pointerId };
		point.current = { x: edge === 'left' ? 0 : Math.max(0, bounds.width - 36), y: top };
		try {
			event.currentTarget.setPointerCapture(event.pointerId);
		} catch {
			/* Pointer capture is optional; the move events still update the ref. */
		}
	};

	const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
		if (!drag.current.active) return;
		const bounds = stageRef.current?.getBoundingClientRect();
		if (!bounds) return;
		const x = Math.max(0, Math.min(bounds.width - 36, event.clientX - bounds.left - 16));
		const y = Math.max(8, Math.min(bounds.height - 88, event.clientY - bounds.top - drag.current.dy));
		if (Math.abs(x - point.current.x) + Math.abs(y - point.current.y) > 4) drag.current.moved = true;
		point.current = { x, y };
		setExpanded(false);
		setFloating({ x, y });
	};

	const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
		if (!drag.current.active) return;
		drag.current.active = false;
		const bounds = stageRef.current?.getBoundingClientRect();
		if (!bounds) return;
		try {
			event.currentTarget.releasePointerCapture(event.pointerId);
		} catch {
			/* Already released, or capture was never taken. */
		}
		if (!drag.current.moved) {
			if (!fine) setExpanded((value) => !value);
			setFloating(null);
			return;
		}
		const x = point.current.x;
		const y = point.current.y;
		setEdge(x + 18 < bounds.width / 2 ? 'left' : 'right');
		setTop(Math.max(8, Math.min(bounds.height - 88, y)));
		setFloating(null);
		setExpanded(false);
	};

	return (
		<div className="meter-stage" ref={stageRef}>
			<motion.div
				className={`meter meter-${tone} ${expanded ? 'is-open' : 'is-bar'} ${edge}`}
				style={floating ? { left: floating.x, top: floating.y, right: 'auto' } : { top }}
				onPointerDown={onPointerDown}
				onPointerMove={onPointerMove}
				onPointerUp={onPointerUp}
				onPointerCancel={onPointerUp}
				onMouseEnter={() => {
					window.clearTimeout(leaveTimer.current);
					if (fine && !floating) setExpanded(true);
				}}
				onMouseLeave={() => {
					if (!fine) return;
					window.clearTimeout(leaveTimer.current);
					leaveTimer.current = window.setTimeout(() => setExpanded(false), reduced ? 0 : 400);
				}}
				animate={{ width: expanded && !floating ? 188 : 14 }}
				transition={{ duration: reduced ? 0 : 0.2 }}
				role="img"
				aria-label="模拟的内存与网速悬浮窗"
			>
				{expanded && !floating ? (
					<div className="meter-capsule">
						<svg viewBox="0 0 48 48" aria-hidden="true">
							<circle cx="24" cy="24" r={radius} className="meter-track" />
							<circle
								cx="24"
								cy="24"
								r={radius}
								className="meter-value"
								strokeDasharray={`${circ}`}
								strokeDashoffset={dash}
							/>
						</svg>
						<div>
							<strong>{Math.round(mem)}%</strong>
							<span>↓ {down.toFixed(1)} MB/s</span>
							<span>↑ {up.toFixed(1)} MB/s</span>
						</div>
					</div>
				) : (
					<span className="meter-fill" style={{ height: `${Math.max(28, mem)}%` }} />
				)}
			</motion.div>
		</div>
	);
}

export default function MengMeterDemo() {
	return (
		<DemoStage caption="拖到左右边缘会吸边，收成内存柱。悬停（触屏则点一下）展开百分比环和上下行。绿 <50、橙 50–80、红 ≥80。数字在本地波动。">
			<Meter />
		</DemoStage>
	);
}
