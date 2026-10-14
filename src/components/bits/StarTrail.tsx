import { useEffect, useRef } from 'react';
import { EFFECTS_EVENT } from '../../lib/effects';

interface Star {
	x: number;
	y: number;
	vx: number;
	vy: number;
	r: number;
	life: number;
	ttl: number;
}

const MAX_STARS = 120;
const LINK_DISTANCE = 110;

function parseColor(input: string) {
	const value = input.trim();
	const hex = value.match(/^#([\da-f]{6})$/i);
	if (!hex) return [196, 92, 38] as const;
	const n = parseInt(hex[1], 16);
	return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}

function rgba(rgb: readonly [number, number, number], alpha: number) {
	const a = Math.max(0, Math.min(1, alpha));
	return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;
}

function canRun() {
	if (document.documentElement.dataset.effects === 'low') return false;
	if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
	if (window.matchMedia('(pointer: coarse)').matches) return false;
	return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

function attach(canvas: HTMLCanvasElement) {
	const ctx = canvas.getContext('2d', { alpha: true });
	if (!ctx) return () => {};

	const stars: Star[] = [];
	let raf = 0;
	let lastSpawn = 0;
	let lx = 0;
	let ly = 0;
	let lt = 0;
	let vx = 0;
	let vy = 0;

	const resize = () => {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		canvas.width = Math.floor(window.innerWidth * dpr);
		canvas.height = Math.floor(window.innerHeight * dpr);
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
	};

	const color = () => parseColor(getComputedStyle(document.documentElement).getPropertyValue('--trail') || '#c45c26');

	const spawn = (now: number, x: number, y: number) => {
		if (now - lastSpawn < 16) return;
		lastSpawn = now;
		const count = 1 + Math.floor(Math.random() * 3);
		for (let i = 0; i < count; i++) {
			if (stars.length >= MAX_STARS) stars.shift();
			stars.push({
				x: x + (Math.random() - 0.5) * 14,
				y: y + (Math.random() - 0.5) * 14,
				vx: vx * 0.15 + (Math.random() - 0.5) * 0.7,
				vy: vy * 0.15 + (Math.random() - 0.5) * 0.7,
				r: 0.7 + Math.random() * 1.6,
				life: 1,
				ttl: 0.007 + Math.random() * 0.01,
			});
		}
	};

	const tick = () => {
		raf = 0;
		if (document.visibilityState !== 'visible' || !canRun()) {
			ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
			stars.length = 0;
			return;
		}

		const width = window.innerWidth;
		const height = window.innerHeight;
		ctx.globalCompositeOperation = 'destination-out';
		ctx.fillStyle = 'rgba(0, 0, 0, 0.16)';
		ctx.fillRect(0, 0, width, height);
		ctx.globalCompositeOperation = 'source-over';

		for (let i = stars.length - 1; i >= 0; i--) {
			const star = stars[i];
			star.x += star.vx;
			star.y += star.vy;
			star.vx *= 0.985;
			star.vy *= 0.985;
			star.life -= star.ttl;
			if (star.life <= 0) stars.splice(i, 1);
		}

		if (stars.length === 0) {
			ctx.clearRect(0, 0, width, height);
			return;
		}

		const rgb = color();
		ctx.lineWidth = 1;
		for (let i = 0; i < stars.length; i++) {
			for (let j = i + 1; j < stars.length; j++) {
				const a = stars[i];
				const b = stars[j];
				const dx = a.x - b.x;
				const dy = a.y - b.y;
				const dist = Math.hypot(dx, dy);
				if (dist > LINK_DISTANCE) continue;
				const alpha = (1 - dist / LINK_DISTANCE) * Math.min(a.life, b.life) * 0.55;
				ctx.strokeStyle = rgba(rgb, alpha);
				ctx.beginPath();
				ctx.moveTo(a.x, a.y);
				ctx.lineTo(b.x, b.y);
				ctx.stroke();
			}
		}

		for (const star of stars) {
			ctx.fillStyle = rgba(rgb, star.life * 0.9);
			ctx.beginPath();
			ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
			ctx.fill();
		}

		raf = requestAnimationFrame(tick);
	};

	const arm = () => {
		if (!raf && document.visibilityState === 'visible') raf = requestAnimationFrame(tick);
	};

	const onMove = (event: PointerEvent) => {
		if (event.pointerType === 'touch') return;
		const now = performance.now();
		if (lt) {
			const dt = Math.max(16, now - lt);
			vx = Math.max(-28, Math.min(28, ((event.clientX - lx) / dt) * 16));
			vy = Math.max(-28, Math.min(28, ((event.clientY - ly) / dt) * 16));
		}
		lx = event.clientX;
		ly = event.clientY;
		lt = now;
		if (!canRun()) return;
		spawn(now, event.clientX, event.clientY);
		arm();
	};

	const onVis = () => {
		if (document.visibilityState !== 'visible' && raf) {
			cancelAnimationFrame(raf);
			raf = 0;
			return;
		}
		if (stars.length) arm();
	};

	resize();
	window.addEventListener('pointermove', onMove, { passive: true });
	window.addEventListener('resize', resize);
	document.addEventListener('visibilitychange', onVis);

	return () => {
		if (raf) cancelAnimationFrame(raf);
		window.removeEventListener('pointermove', onMove);
		window.removeEventListener('resize', resize);
		document.removeEventListener('visibilitychange', onVis);
		ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
	};
}

export default function StarTrail() {
	const ref = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = ref.current;
		if (!canvas) return;
		let stop = () => {};
		const sync = () => {
			stop();
			stop = canRun() ? attach(canvas) : () => {};
		};
		sync();
		const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
		const coarse = window.matchMedia('(pointer: coarse)');
		reduced.addEventListener('change', sync);
		coarse.addEventListener('change', sync);
		document.documentElement.addEventListener(EFFECTS_EVENT, sync);
		return () => {
			stop();
			reduced.removeEventListener('change', sync);
			coarse.removeEventListener('change', sync);
			document.documentElement.removeEventListener(EFFECTS_EVENT, sync);
		};
	}, []);

	return <canvas ref={ref} className="star-trail" aria-hidden="true" />;
}
