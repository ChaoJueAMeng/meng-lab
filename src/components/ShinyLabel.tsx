import ShinyText from './bits/ShinyText';
import { useTheme } from '../hooks/useTheme';

export default function ShinyLabel({ text }: { text: string }) {
	const theme = useTheme();

	return (
		<ShinyText
			text={text}
			speed={2.4}
			delay={1.6}
			color={theme === 'dark' ? '#9b9386' : '#6b645b'}
			shineColor={theme === 'dark' ? '#ece6da' : '#1c1915'}
		/>
	);
}
