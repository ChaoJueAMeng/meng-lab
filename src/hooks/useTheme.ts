import { useEffect, useState } from 'react';
import { type ResolvedTheme } from '../lib/theme';

export function useTheme(): ResolvedTheme {
	const [theme, setTheme] = useState<ResolvedTheme>('light');

	useEffect(() => {
		const root = document.documentElement;
		const sync = () => {
			setTheme(root.dataset.theme === 'dark' ? 'dark' : 'light');
		};
		sync();
		const observer = new MutationObserver(sync);
		observer.observe(root, { attributes: true, attributeFilter: ['data-theme'] });
		return () => observer.disconnect();
	}, []);

	return theme;
}
