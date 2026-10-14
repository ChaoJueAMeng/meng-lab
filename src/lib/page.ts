import { normalizePath } from './nav';
import { stripBase } from './paths';

export type PageId = 'home' | 'notes' | 'projects' | 'about' | 'other';

export function pageIdFromPath(pathname: string): PageId {
	const path = normalizePath(stripBase(pathname));
	if (path === '/') return 'home';
	if (path === '/notes' || path.startsWith('/notes/')) return 'notes';
	if (path === '/projects' || path.startsWith('/projects/')) return 'projects';
	if (path === '/about') return 'about';
	return 'other';
}
