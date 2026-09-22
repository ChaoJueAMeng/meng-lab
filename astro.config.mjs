// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';

const githubPages = process.env.GITHUB_PAGES === 'true';

export default defineConfig({
	site: githubPages ? 'https://chaojueameng.github.io' : 'https://notes.cjameng.top',
	base: githubPages ? '/meng-lab' : '/',
	integrations: [sitemap(), react()],
	markdown: {
		shikiConfig: {
			themes: {
				light: 'github-light',
				dark: 'github-dark-dimmed',
			},
		},
	},
});
