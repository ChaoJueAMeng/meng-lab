import { useEffect, useState } from 'react';
import Aurora from './bits/Aurora';
import { useTheme } from '../hooks/useTheme';

function effectsAllowed() {
	return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function AuroraBackground() {
	const theme = useTheme();
	const [on, setOn] = useState(false);
	const colorStops =
		theme === 'dark' ? ['#8b3d1a', '#c45c26', '#4a2816'] : ['#f3d2b3', '#df9b6d', '#f6e7d4'];

	useEffect(() => {
		const sync = () => setOn(effectsAllowed());
		sync();
		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		media.addEventListener('change', sync);
		return () => {
			media.removeEventListener('change', sync);
		};
	}, []);

	if (!on) return null;

	return (
		<div className="aurora-layer" aria-hidden="true">
			<Aurora colorStops={colorStops} amplitude={0.55} blend={0.62} speed={0.35} />
		</div>
	);
}
