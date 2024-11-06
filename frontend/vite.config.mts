import { defineConfig } from 'vite';
import htmlToTemplatePlugin from './npm-scripts/vite-plugins/htmlToTemplatePlugin';
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/
export default defineConfig({
	// Entry point for your application
	assetsInclude: ['**/*.svg'],
	root: '',
	build: {
		outDir: 'dist', // Output directory for production build
		sourcemap: true, // Enable sourcemaps for easier debugging
		manifest: true,
		rollupOptions: {
			external: ['**/*.html'],
			output: {
				manualChunks(id) {
					if (id.includes('node_modules')) {
						return 'vendor'; // Separate vendor dependencies
					}
					if (id.includes('TemplatedComponent')) {
						return 'templated-component';
					}
					if (id.includes('Toast')) {
						return 'comp-utils';
					}
					if (id.includes('FormComponent')) {
						return 'comp-utils';
					}
					if (id.includes('AppComponent')) {
						return 'comp-utils';
					}
				},
			},
			plugins: [
				htmlToTemplatePlugin(),
				viteStaticCopy({
					targets: [
						{
							src: 'node_modules/@shoelace-style/shoelace/dist/assets/icons/*', // Path to Shoelace icons
							dest: 'assets/icons', // Destination folder in the build output
						},
					],
				}),
			],
		},
	},
	plugins: [htmlToTemplatePlugin()],
});
