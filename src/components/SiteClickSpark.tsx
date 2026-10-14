import { useEffect, useState } from 'react';
import ClickSpark from './bits/ClickSpark';
import { EFFECTS_EVENT } from '../lib/effects';
import { useTheme } from '../hooks/useTheme';

function sparksAllowed() {
	if (document.documentElement.dataset.effects === 'low') return false;
	return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export default function SiteClickSpark() {
	const theme = useTheme();
	const [on, setOn] = useState(false);

	useEffect(() => {
		const sync = () => setOn(sparksAllowed());
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
		<div className="site-spark-layer" aria-hidden="true">
			<ClickSpark
				sparkColor={theme === 'dark' ? '#e8a06a' : '#c45c26'}
				sparkCount={9}
				sparkSize={8}
				sparkRadius={16}
				duration={420}
			/>
		</div>
	);
}
