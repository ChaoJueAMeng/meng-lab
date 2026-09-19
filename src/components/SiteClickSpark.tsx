import ClickSpark from './bits/ClickSpark';
import { useTheme } from '../hooks/useTheme';

export default function SiteClickSpark() {
	const theme = useTheme();

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
