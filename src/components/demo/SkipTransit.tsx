import { useEffect, useRef, useState } from 'react';
import './demos.css';

const STORAGE = 'meng-lab-skip-transit';

function readMap(): Record<string, true> {
	try {
		const parsed = JSON.parse(localStorage.getItem(STORAGE) || '{}') as unknown;
		if (!parsed || typeof parsed !== 'object') return {};
		return parsed as Record<string, true>;
	} catch {
		return {};
	}
}

interface Props {
	id: string;
	href?: string;
}

export default function SkipTransit({ id, href }: Props) {
	const [saved, setSaved] = useState(false);
	const [armed, setArmed] = useState(false);
	const timer = useRef(0);

	useEffect(() => {
		const remembered = Boolean(readMap()[id]);
		setSaved(remembered);
		if (!remembered || !href) return;
		setArmed(true);
		timer.current = window.setTimeout(() => {
			window.location.assign(href);
		}, 1600);
		return () => window.clearTimeout(timer.current);
	}, [href, id]);

	const persist = (next: boolean) => {
		const map = readMap();
		if (next) map[id] = true;
		else delete map[id];
		localStorage.setItem(STORAGE, JSON.stringify(map));
		setSaved(next);
	};

	return (
		<div className="skip-transit">
			{armed && href && (
				<div className="skip-banner" role="status">
					<p>已记住直接打开，即将前往原地址。</p>
					<a href={href} target="_blank" rel="noopener">
						立即前往
					</a>
					<button
						type="button"
						onClick={() => {
							window.clearTimeout(timer.current);
							persist(false);
							setArmed(false);
						}}
					>
						留下并取消
					</button>
				</div>
			)}
			{href && (
				<label className="skip-check">
					<input
						type="checkbox"
						checked={saved}
						onChange={(event) => {
							persist(event.target.checked);
							if (!event.target.checked) {
								window.clearTimeout(timer.current);
								setArmed(false);
							}
						}}
					/>
					下次直接打开
				</label>
			)}
		</div>
	);
}
