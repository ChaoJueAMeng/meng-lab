import React, { useRef, useEffect } from 'react';

interface ClickSparkProps {
	sparkColor?: string;
	sparkSize?: number;
	sparkRadius?: number;
	sparkCount?: number;
	duration?: number;
	easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
	extraScale?: number;
	children?: React.ReactNode;
}

interface Spark {
	x: number;
	y: number;
	angle: number;
	startTime: number;
}

const ClickSpark: React.FC<ClickSparkProps> = ({
	sparkColor = '#fff',
	sparkSize = 6,
	sparkRadius = 12,
	sparkCount = 6,
	duration = 340,
	easing = 'ease-out',
	extraScale = 1.0,
	children,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const sparksRef = useRef<Spark[]>([]);
	const configRef = useRef({ sparkColor, sparkSize, sparkRadius, sparkCount, duration, easing, extraScale });
	configRef.current = { sparkColor, sparkSize, sparkRadius, sparkCount, duration, easing, extraScale };

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const parent = canvas.parentElement;
		if (!parent) return;

		let resizeTimeout: ReturnType<typeof setTimeout>;

		const resizeCanvas = () => {
			const { width, height } = parent.getBoundingClientRect();
			if (canvas.width !== width || canvas.height !== height) {
				canvas.width = width;
				canvas.height = height;
			}
		};

		const handleResize = () => {
			clearTimeout(resizeTimeout);
			resizeTimeout = setTimeout(resizeCanvas, 100);
		};

		const ro = new ResizeObserver(handleResize);
		ro.observe(parent);

		resizeCanvas();

		return () => {
			ro.disconnect();
			clearTimeout(resizeTimeout);
		};
	}, []);

	const spawnRef = useRef<(clientX: number, clientY: number) => void>(() => {});

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let animationId = 0;
		let running = false;
		let downX = 0;
		let downY = 0;
		let pointerKind = 'mouse';

		const ease = (t: number) => {
			switch (configRef.current.easing) {
				case 'linear':
					return t;
				case 'ease-in':
					return t * t;
				case 'ease-in-out':
					return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
				default:
					return t * (2 - t);
			}
		};

		const draw = (timestamp: number) => {
			if (document.hidden) {
				running = false;
				return;
			}
			const { sparkColor, sparkSize, sparkRadius, duration, extraScale } = configRef.current;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			sparksRef.current = sparksRef.current.filter((spark: Spark) => {
				const elapsed = timestamp - spark.startTime;
				if (elapsed >= duration) return false;
				const progress = elapsed / duration;
				const eased = ease(progress);
				const distance = eased * sparkRadius * extraScale;
				const lineLength = sparkSize * (1 - eased);
				const x1 = spark.x + distance * Math.cos(spark.angle);
				const y1 = spark.y + distance * Math.sin(spark.angle);
				const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
				const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);
				ctx.strokeStyle = sparkColor;
				ctx.globalAlpha = Math.max(0, 0.72 * (1 - progress));
				ctx.lineWidth = 1.4;
				ctx.lineCap = 'round';
				ctx.beginPath();
				ctx.moveTo(x1, y1);
				ctx.lineTo(x2, y2);
				ctx.stroke();
				ctx.globalAlpha = 1;
				return true;
			});
			if (sparksRef.current.length > 0) animationId = requestAnimationFrame(draw);
			else running = false;
		};

		const start = () => {
			if (running || document.hidden || sparksRef.current.length === 0) return;
			running = true;
			animationId = requestAnimationFrame(draw);
		};

		const spawn = (clientX: number, clientY: number) => {
			const rect = canvas.getBoundingClientRect();
			const { sparkCount } = configRef.current;
			const now = performance.now();
			const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => ({
				x: clientX - rect.left,
				y: clientY - rect.top,
				angle: (2 * Math.PI * i) / sparkCount + Math.PI / 12,
				startTime: now,
			}));
			sparksRef.current.push(...newSparks);
			start();
		};

		spawnRef.current = spawn;

		const onPointerDown = (event: PointerEvent) => {
			pointerKind = event.pointerType;
			if (event.button !== 0 || event.pointerType === 'touch') return;
			downX = event.clientX;
			downY = event.clientY;
		};

		const onClick = (event: MouseEvent) => {
			if (event.detail === 0 || pointerKind === 'touch') return;
			if (Math.hypot(event.clientX - downX, event.clientY - downY) > 6) return;
			const selection = window.getSelection();
			if (selection && selection.toString().length > 0) return;
			spawn(event.clientX, event.clientY);
		};

		const onVis = () => {
			if (document.hidden) {
				running = false;
				cancelAnimationFrame(animationId);
				return;
			}
			start();
		};

		document.addEventListener('pointerdown', onPointerDown, { passive: true });
		document.addEventListener('click', onClick, { passive: true });
		document.addEventListener('visibilitychange', onVis);
		return () => {
			cancelAnimationFrame(animationId);
			sparksRef.current = [];
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			spawnRef.current = () => {};
			document.removeEventListener('pointerdown', onPointerDown);
			document.removeEventListener('click', onClick);
			document.removeEventListener('visibilitychange', onVis);
		};
	}, []);

	const handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
		if (children) spawnRef.current(e.clientX, e.clientY);
	};

	return (
		<div
			className="click-spark"
			style={{
				width: '100%',
				height: '100%',
				position: 'relative',
				pointerEvents: children ? 'auto' : 'none',
			}}
			onClick={children ? handleClick : undefined}
		>
			<canvas
				ref={canvasRef}
				style={{
					position: 'absolute',
					inset: 0,
					pointerEvents: 'none',
				}}
			/>
			{children}
		</div>
	);
};

export default ClickSpark;
