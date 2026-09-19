/** Prefix a site-root path with Astro `base` (`/` locally, `/meng-lab/` on GitHub Pages). */
export function withBase(path: string): string {
	const base = import.meta.env.BASE_URL.replace(/\/$/, '');
	if (path === '/') return `${base}/`;
	const normalized = path.startsWith('/') ? path : `/${path}`;
	return `${base}${normalized}`;
}

/** Strip `base` so nav matching still uses `/notes`, `/about`, etc. */
export function stripBase(pathname: string): string {
	const base = import.meta.env.BASE_URL.replace(/\/$/, '');
	if (!base) return pathname || '/';
	if (pathname === base || pathname === `${base}/`) return '/';
	if (pathname.startsWith(`${base}/`)) return pathname.slice(base.length) || '/';
	return pathname;
}
