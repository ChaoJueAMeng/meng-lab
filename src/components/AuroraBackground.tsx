import { useEffect, useState } from 'react';
import Aurora from './bits/Aurora';
import { EFFECTS_EVENT } from '../lib/effects';
import { useTheme } from '../hooks/useTheme';

function effectsAllowed() {
	if (document.documentElement.dataset.effects === 'low') return false;
	return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function AuroraBackground() {
	const theme = useTheme();
	const [on, setOn] = useState(false);
	const colorStops =
		theme === 'dark' ? ['#c45c26', '#e8a06a', '#8b3d1a'] : ['#e8a06a', '#c45c26', '#f3d2b3'];

	useEffect(() => {
		const sync = () => setOn(effectsAllowed());
		sync();
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		media.addEventListener('change', sync);
		document.documentElement.addEventListener(EFFECTS_EVENT, sync);
		return () => {
			media.removeEventListener('change', sync);
			document.documentElement.removeEventListener(EFFECTS_EVENT, sync);
		};
	}, []);

	if (!on) return null;

	return (
		<div className="aurora-layer" aria-hidden="true">
			<Aurora colorStops={colorStops} amplitude={0.85} blend={0.55} speed={0.55} />
		</div>
	);
}
