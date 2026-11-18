import { useEffect, useState } from 'react';

export default function ClockCard() {
	const [now, setNow] = useState<Date | null>(null);

	useEffect(() => {
		let timer = 0;
		const tick = () => setNow(new Date());
		const arm = () => {
			window.clearInterval(timer);
			if (document.hidden) return;
			tick();
			timer = window.setInterval(tick, 1000);
		};
		arm();
		document.addEventListener('visibilitychange', arm);
		return () => {
			window.clearInterval(timer);
			document.removeEventListener('visibilitychange', arm);
		};
	}, []);

	const time = now
		? new Intl.DateTimeFormat('zh-CN', {
				timeZone: 'Asia/Shanghai',
				hour: '2-digit',
				minute: '2-digit',
				second: '2-digit',
				hourCycle: 'h23',
			}).format(now)
		: '00:00:00';

	return (
		<span
			className={`lab-clock ${now ? 'is-ready' : 'is-pending'}`}
			title="上海时间 (UTC+8)"
			aria-label={now ? `上海时间 ${time}` : '上海时间'}
		>
			<span className="lab-clock-zone">UTC+8</span>
			<time className="lab-clock-digits">{time}</time>
		</span>
	);
}
