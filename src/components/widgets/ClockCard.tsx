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
		: '––:––:––';
	const date = now
		? new Intl.DateTimeFormat('zh-CN', {
				timeZone: 'Asia/Shanghai',
				dateStyle: 'full',
			}).format(now)
		: '上海时间';

	return (
		<section className="widget-card clock-card" aria-label="当前日期和时间">
			<p className="widget-kicker">现在</p>
			<p className="clock-time">{time}</p>
			<p className="clock-date">{date}</p>
		</section>
	);
}
