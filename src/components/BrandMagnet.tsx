import Magnet from './bits/Magnet';

export default function BrandMagnet({ children }: { children: React.ReactNode }) {
	return (
		<Magnet padding={48} magnetStrength={3.4} wrapperClassName="brand-magnet">
			{children}
		</Magnet>
	);
}
