import SpotlightCard from './bits/SpotlightCard';
import { useTheme } from '../hooks/useTheme';

interface Props {
	children: React.ReactNode;
	featured?: boolean;
}

export default function ProjectCard({ children, featured = false }: Props) {
	const theme = useTheme();
	const spotlightColor =
		theme === 'dark' ? 'rgba(232, 160, 106, 0.14)' : 'rgba(196, 92, 38, 0.11)';

	return (
		<SpotlightCard
			className={`project-spotlight ${featured ? 'is-featured-card' : ''}`}
			spotlightColor={spotlightColor}
		>
			{children}
		</SpotlightCard>
	);
}
