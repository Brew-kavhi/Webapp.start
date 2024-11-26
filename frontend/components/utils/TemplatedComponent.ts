import mainStyle from '/css/main.module.css?raw';
import bootstrap from '/node_modules/bootstrap/dist/css/bootstrap.min.css?raw';
import icons from '/node_modules/@shoelace-style/shoelace/dist/themes/light.css?raw';

export class TemplatedComponent extends HTMLElement {
	static templateFile: string = '';
	static templateCache: string | null = null;

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		document.addEventListener('language-changed',(e) => this.languageChanged(e));
	}

	languageChanged(e) {
		if (this.render) {
			this.render();
		}
	}

	addBootstrap() {
		const style = document.createElement('style');
		style.textContent = `${mainStyle}${bootstrap}`;
		this.shadowRoot?.appendChild(style);
	}

	addIcons() {
		const style = document.createElement('style');
		style.textContent = `${icons}`;
		this.shadowRoot?.appendChild(style);
	}
}
