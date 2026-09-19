// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const githubPages = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
	site: githubPages ? 'https://chaojueameng.github.io' : 'https://notes.cjameng.top',
	base: githubPages ? '/meng-lab' : '/',
	integrations: [sitemap()],
	markdown: {
		shikiConfig: {
			theme: 'github-dark-dimmed',
		},
	},
});
