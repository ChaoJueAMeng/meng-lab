import Aurora from './bits/Aurora';
import { useTheme } from '../hooks/useTheme';

export default function AuroraBackground() {
	const theme = useTheme();
	const colorStops =
		theme === 'dark' ? ['#c45c26', '#e8a06a', '#8b3d1a'] : ['#e8a06a', '#c45c26', '#f3d2b3'];

	return (
		<div className="aurora-layer" aria-hidden="true">
			<Aurora colorStops={colorStops} amplitude={0.85} blend={0.55} speed={0.55} />
		</div>
	);
}
