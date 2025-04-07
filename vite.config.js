import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		proxy: {
			'/api': {
				target: 'http://localhost:5001'
			}
		}
	},
	preview: {
		allowedHosts: ['vardhin.tech', 'www.vardhin.tech']
	}
});
