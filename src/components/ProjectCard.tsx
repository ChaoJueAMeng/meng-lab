import SpotlightCard from './bits/SpotlightCard';
import { useTheme } from '../hooks/useTheme';

export default function ProjectCard({ children }: { children: React.ReactNode }) {
	const theme = useTheme();
	const spotlightColor =
		theme === 'dark' ? 'rgba(232, 160, 106, 0.22)' : 'rgba(196, 92, 38, 0.18)';

	return (
		<SpotlightCard className="project-spotlight" spotlightColor={spotlightColor}>
			{children}
		</SpotlightCard>
	);
}
