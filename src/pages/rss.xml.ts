import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { getNotes } from '../lib/content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
	const notes = await getNotes();
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: context.site ?? 'https://notes.cjameng.top',
		items: notes.map((note) => ({
			title: note.data.title,
			pubDate: note.data.pubDate,
			description: note.data.description,
			link: `/notes/${note.id}/`,
		})),
	});
}
