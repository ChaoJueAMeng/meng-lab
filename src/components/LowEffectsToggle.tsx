import { useEffect, useState } from 'react';
import { EFFECTS_EVENT, setLowEffects } from '../lib/effects';

export default function LowEffectsToggle() {
	const [low, setLow] = useState(false);

	useEffect(() => {
		const sync = () => setLow(document.documentElement.dataset.effects === 'low');
		sync();
		document.documentElement.addEventListener(EFFECTS_EVENT, sync);
		const observer = new MutationObserver(sync);
		observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-effects'] });
		return () => {
			document.documentElement.removeEventListener(EFFECTS_EVENT, sync);
			observer.disconnect();
		};
	}, []);

	return (
		<button
			type="button"
			className="effects-toggle"
			aria-pressed={low}
			onClick={() => {
				const next = !low;
				setLowEffects(next);
				setLow(next);
			}}
		>
			{low ? '低特效：开' : '低特效'}
		</button>
	);
}
