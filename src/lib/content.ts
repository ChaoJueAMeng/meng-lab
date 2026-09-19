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
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');
	return `${year}/${month}/${day}`;
}
