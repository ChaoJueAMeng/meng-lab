import BlurText from './bits/BlurText';

interface Props {
	text: string;
	className?: string;
}

export default function HeroHeading({ text, className = 'hero-title' }: Props) {
	return (
		<BlurText
			text={text}
			className={`${className} hero-title-anim`}
			animateBy="letters"
			direction="top"
			delay={36}
			stepDuration={0.28}
		/>
	);
}
