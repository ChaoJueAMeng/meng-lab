import GradientText from './bits/GradientText';

export default function HeroKicker({ text }: { text: string }) {
	return (
		<GradientText
			className="hero-kicker"
			colors={['#c45c26', '#e8a06a', '#a84a1c']}
			animationSpeed={6}
			pauseOnHover
		>
			{text}
		</GradientText>
	);
}
