import { TemplatedComponent } from '/components/utils/TemplatedComponent';
import templateHTML from '/components/utils/templates/not_found.html';

export class NotFound extends TemplatedComponent {
	constructor() {
		super();
	}

	connectedCallback() {
		this.render();
	}

	render() {
		this.shadowRoot.innerHTML = this.dynamicHTML(templateHTML);
	}
}
customElements.define('not-found', NotFound);
