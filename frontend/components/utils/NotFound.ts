import { TemplatedComponent } from '/components/utils/TemplatedComponent';

export class NotFound extends TemplatedComponent {
	constructor() {
		super();
		NotFound.templateFile = '/components/utils/templates/not_found.html';
	}

	connectedCallback() {
		this.loadTemplate(NotFound).then(() => this.render());
	}

	render() {
		this.shadowRoot.innerHTML = this.prepareHTML(NotFound);
	}
}
customElements.define('not-found', NotFound);
