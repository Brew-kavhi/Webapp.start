import fs from 'fs/promises';
import MagicString from 'magic-string';

export default function htmlToTemplatePlugin() {
	var moduleName = '';
	return {
		name: 'html-to-template-plugin',
		async load(id: string) {
			if (id.includes('virtual:components')) {
				const path = id.replace('\x00virtual:','');
				// Read and escape HTML content
				this.addWatchFile(
					'/home/arbeit/projects/brew.kavhi/frontend/' + path + '.html'
				);
				const htmlContent = await fs.readFile(path + '.html', 'utf-8');
				const escapedContent = htmlContent;
				console.log(path + ' is loaded.');
				// Create a function that accepts dynamic values and returns the template
				const jsContent = `export default (props) => \`${escapedContent}\`;`;

				return jsContent;
			}
		},
		/*async transform(src, id: string) {
			if (id.includes('virtual:components')) {
				return src;
			}
		},*/

		async resolveId(source, importer) {
			if (source.includes('virtual:components')) {
				if (!moduleName) {
					moduleName = importer;
				}
				return '\0' + source;
			}
			return null;
		},
		handleHotUpdate({ file, server, modules }) {
			// Check if the changed file is the one we are watching
			if (file.endsWith('.html')) {
				const affectedModule = server.moduleGraph.getModuleById(moduleName);
				moduleName = undefined;
				if (affectedModule) {
					console.log("trigger reload");
					// Trigger HMR update for the module
					server.moduleGraph.invalidateModule(affectedModule);
					server.ws.send({
						type: 'full-reload',
					});
				}
				return [affectedModule];
			}
		},
	};
}
