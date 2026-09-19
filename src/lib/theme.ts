export const THEME_KEY = 'meng-lab-theme';

export type ThemePref = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

export function isThemePref(value: string | null): value is ThemePref {
	return value === 'light' || value === 'dark' || value === 'system';
}

export function getThemePref(): ThemePref {
	if (typeof localStorage === 'undefined') return 'light';
	const stored = localStorage.getItem(THEME_KEY);
	return isThemePref(stored) ? stored : 'light';
}

export function resolveTheme(pref: ThemePref): ResolvedTheme {
	if (pref === 'system') {
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	return pref;
}

export function applyTheme(pref: ThemePref) {
	const theme = resolveTheme(pref);
	const root = document.documentElement;
	root.dataset.theme = theme;
	root.dataset.themePref = pref;
	root.style.colorScheme = theme;
}

export function setThemePref(pref: ThemePref) {
	localStorage.setItem(THEME_KEY, pref);
	applyTheme(pref);
}
