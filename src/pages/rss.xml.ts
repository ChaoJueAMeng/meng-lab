import rss from '@astrojs/rss';
import { SITE_DESCRIPTION, SITE_TITLE } from '../consts';
import { getNotes } from '../lib/content';
import { withBase } from '../lib/paths';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
	const notes = await getNotes();
	return rss({
		title: SITE_TITLE,
		description: SITE_DESCRIPTION,
		site: new URL(import.meta.env.BASE_URL, context.site ?? 'https://notes.cjameng.top').href,
		items: notes.map((note) => ({
			title: note.data.title,
			pubDate: note.data.pubDate,
			description: note.data.description,
			link: withBase(`/notes/${note.id}/`),
		})),
	});
}
