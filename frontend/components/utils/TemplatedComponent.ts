export class TemplatedComponent extends HTMLElement {
	static templateFile: string = '';
	static templateCache: string | null = null;

	async loadTemplate(Component) {
		//if (!Component.templateCache) {
		if (true) {
			//Fetch the template only if not cached
			const templateResponse = await fetch(Component.templateFile);
			Component.templateCache = await templateResponse.text();
		}
	}

	prepareHTML(Component) {
		return Component.templateCache.replace(/\${(.*?)}/g, (x, g) =>
			getValueByPath(this, g)
		);
	}

}
function getValueByPath(obj: any, path: string): any {
	return path.split('.').reduce((accumulator, part) => accumulator && accumulator[part], obj);
}
