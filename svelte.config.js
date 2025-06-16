import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),
	kit: {
		adapter: adapter({
			runtime: 'nodejs20.x'
		}),
		files: {
			lib: 'src/lib',
			routes: 'src/routes'
		},
		alias: {
			$lib: 'src/lib'
		}
	}
};

export default config;