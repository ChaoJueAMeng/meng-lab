export const NAV_ITEMS = [
	{ href: '/', label: '主页' },
	{ href: '/notes', label: '笔记' },
	{ href: '/projects', label: '作品' },
	{ href: '/about', label: '关于' },
] as const;

export function normalizePath(pathname: string) {
	if (!pathname || pathname === '/') return '/';
	return pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
}

export function isCurrent(pathname: string, href: string) {
	const path = normalizePath(pathname);
	if (href === '/') return path === '/';
	return path === href || path.startsWith(`${href}/`);
}
