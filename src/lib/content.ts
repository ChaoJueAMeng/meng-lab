import { getCollection, type CollectionEntry } from 'astro:content';

export type StatusTone = 'live' | 'repo' | 'lab' | 'tool';

export interface ProjectLinkItem {
	label: string;
	shortLabel: string;
	url: string;
	kind: 'live' | 'github' | 'release';
}

export async function getNotes() {
	const notes = await getCollection('notes');
	return notes.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getProjects() {
	const projects = await getCollection('projects');
	return projects.sort((a, b) => a.data.order - b.data.order);
}

export function formatDate(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}.${month}.${day}`;
}

export function formatSerial(index: number, prefix = 'NO.') {
	return `${prefix}${String(index + 1).padStart(2, '0')}`;
}

export function estimateReadingMinutes(body?: string): number {
	if (!body) return 1;
	const clean = body
		.replace(/```[\s\S]*?```/g, ' ')
		.replace(/`[^`]*`/g, ' ')
		.replace(/<[^>]+>/g, ' ')
		.replace(/[#>*_~[\]()!-]/g, ' ');
	const cjk = (clean.match(/[\u4e00-\u9fff]/g) ?? []).length;
	const latinWords = clean
		.replace(/[\u4e00-\u9fff]/g, ' ')
		.trim()
		.split(/\s+/)
		.filter(Boolean).length;
	const minutes = Math.ceil(cjk / 320 + latinWords / 200);
	return Math.max(1, minutes);
}

export function getStatusTone(status: string): StatusTone {
	if (status.includes('上线')) return 'live';
	if (status.includes('公开')) return 'repo';
	if (status.includes('实验')) return 'lab';
	return 'tool';
}

export function getProjectLinks(project: CollectionEntry<'projects'>): {
	primary?: ProjectLinkItem;
	secondary?: ProjectLinkItem;
} {
	const { href, readme } = project.data;
	const derivedRepo =
		readme && readme !== 'private'
			? readme.replace(/\/blob\/[^/]+\/README(\.[a-z-]+)?\.md$/i, '')
			: undefined;

	if (!href) {
		if (derivedRepo) {
			return {
				primary: {
					label: '查看 GitHub 仓库',
					shortLabel: 'GitHub',
					url: derivedRepo,
					kind: 'github',
				},
			};
		}
		return {};
	}

	if (href.includes('github.com') && href.includes('/releases')) {
		const primary: ProjectLinkItem = {
			label: '前往下载 / Releases',
			shortLabel: '发行版',
			url: href,
			kind: 'release',
		};
		const secondary: ProjectLinkItem | undefined =
			derivedRepo && derivedRepo !== href
				? {
						label: '查看 GitHub 源码',
						shortLabel: 'GitHub',
						url: derivedRepo,
						kind: 'github',
					}
				: undefined;
		return { primary, secondary };
	}

	if (href.includes('github.com')) {
		return {
			primary: {
				label: '查看 GitHub 仓库',
				shortLabel: 'GitHub',
				url: href,
				kind: 'github',
			},
		};
	}

	return {
		primary: {
			label: '访问线上地址',
			shortLabel: '线上访问',
			url: href,
			kind: 'live',
		},
		secondary: derivedRepo
			? {
					label: '查看 GitHub 源码',
					shortLabel: 'GitHub',
					url: derivedRepo,
					kind: 'github',
				}
			: undefined,
	};
}
