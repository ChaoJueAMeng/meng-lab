import React, { useRef, useEffect, useCallback } from 'react';

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
	sparkSize = 10,
	sparkRadius = 15,
	sparkCount = 8,
	duration = 400,
	easing = 'ease-out',
	extraScale = 1.0,
	children,
}) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const sparksRef = useRef<Spark[]>([]);

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

	const easeFunc = useCallback(
		(t: number) => {
			switch (easing) {
				case 'linear':
					return t;
				case 'ease-in':
					return t * t;
				case 'ease-in-out':
					return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
				default:
					return t * (2 - t);
			}
		},
		[easing],
	);

	const spawnSparks = (clientX: number, clientY: number) => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const rect = canvas.getBoundingClientRect();
		const x = clientX - rect.left;
		const y = clientY - rect.top;

		const now = performance.now();
		const newSparks: Spark[] = Array.from({ length: sparkCount }, (_, i) => ({
			x,
			y,
			angle: (2 * Math.PI * i) / sparkCount,
			startTime: now,
		}));

		sparksRef.current.push(...newSparks);
	};

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;
		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		let animationId = 0;
		let running = false;

		const draw = (timestamp: number) => {
			if (document.hidden) {
				running = false;
				return;
			}
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			sparksRef.current = sparksRef.current.filter((spark: Spark) => {
				const elapsed = timestamp - spark.startTime;
				if (elapsed >= duration) return false;
				const progress = elapsed / duration;
				const eased = easeFunc(progress);
				const distance = eased * sparkRadius * extraScale;
				const lineLength = sparkSize * (1 - eased);
				const x1 = spark.x + distance * Math.cos(spark.angle);
				const y1 = spark.y + distance * Math.sin(spark.angle);
				const x2 = spark.x + (distance + lineLength) * Math.cos(spark.angle);
				const y2 = spark.y + (distance + lineLength) * Math.sin(spark.angle);
				ctx.strokeStyle = sparkColor;
				ctx.lineWidth = 2;
				ctx.beginPath();
				ctx.moveTo(x1, y1);
				ctx.lineTo(x2, y2);
				ctx.stroke();
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

		const onPointerDown = (event: PointerEvent) => {
			spawnSparks(event.clientX, event.clientY);
			start();
		};
		const onVis = () => {
			if (document.hidden) {
				running = false;
				cancelAnimationFrame(animationId);
				return;
			}
			start();
		};

		document.addEventListener('pointerdown', onPointerDown);
		document.addEventListener('visibilitychange', onVis);
		return () => {
			cancelAnimationFrame(animationId);
			document.removeEventListener('pointerdown', onPointerDown);
			document.removeEventListener('visibilitychange', onVis);
		};
	}, [sparkColor, sparkSize, sparkRadius, sparkCount, duration, easeFunc, extraScale]);

	const handleClick = (e: React.MouseEvent<HTMLDivElement>): void => {
		if (children) spawnSparks(e.clientX, e.clientY);
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
