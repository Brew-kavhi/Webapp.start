export class TemplatedComponent extends HTMLElement {
    static templateFile = "";
    static templateCache = null;
    async loadTemplate(Component) {
        //if (!Component.templateCache) {
        if (true) {
            //Fetch the template only if not cached
            const templateResponse = await fetch(Component.templateFile);
            Component.templateCache = await templateResponse.text();
        }
    }
    prepareHTML(Component) {
        return Component.templateCache.replace(/\${(.*?)}/g, (x, g) => eval('`${' + g + '}`'));
    }
}
