import { useEffect, useState } from 'react';
import { applyTheme, getThemePref, setThemePref, type ThemePref } from '../lib/theme';

const OPTIONS: { id: ThemePref; label: string }[] = [
	{ id: 'light', label: '浅色' },
	{ id: 'dark', label: '深色' },
	{ id: 'system', label: '系统' },
];

export default function ThemeToggle() {
	const [pref, setPref] = useState<ThemePref>('light');

	useEffect(() => {
		const current = getThemePref();
		setPref(current);
		applyTheme(current);

		const media = window.matchMedia('(prefers-color-scheme: dark)');
		const onSystemChange = () => {
			if (getThemePref() === 'system') applyTheme('system');
		};
		media.addEventListener('change', onSystemChange);
		return () => media.removeEventListener('change', onSystemChange);
	}, []);

	return (
		<div className="theme-toggle" role="radiogroup" aria-label="主题">
			{OPTIONS.map((option) => (
				<button
					key={option.id}
					type="button"
					role="radio"
					data-option={option.id}
					aria-checked={pref === option.id}
					className={pref === option.id ? 'is-active' : undefined}
					onClick={() => {
						setPref(option.id);
						setThemePref(option.id);
					}}
				>
					{option.label}
				</button>
			))}
		</div>
	);
}
