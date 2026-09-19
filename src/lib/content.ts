import { getCollection } from 'astro:content';

export async function getNotes() {
	const notes = await getCollection('notes');
	return notes.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export async function getProjects() {
	const projects = await getCollection('projects');
	return projects.sort((a, b) => a.data.order - b.data.order);
}

export function formatDate(date: Date) {
	return date.toLocaleDateString('zh-CN', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
	});
}
