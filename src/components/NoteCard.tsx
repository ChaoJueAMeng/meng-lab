import GlareHover from './bits/GlareHover';
import { useTheme } from '../hooks/useTheme';

export default function NoteCard({ children }: { children: React.ReactNode }) {
	const theme = useTheme();

	return (
		<GlareHover
			width="100%"
			height="auto"
			background="transparent"
			borderRadius="1rem"
			borderColor="transparent"
			glareColor={theme === 'dark' ? '#ffffff' : '#c45c26'}
			glareOpacity={theme === 'dark' ? 0.16 : 0.2}
			glareSize={220}
			className="note-glare"
		>
			{children}
		</GlareHover>
	);
}
