import { TemplatedComponent } from '/components/utils/TemplatedComponent';
import templateHTML from 'virtual:components/utils/templates/not_found';

export class NotFound extends TemplatedComponent {
	constructor() {
		super();
	}

	connectedCallback() {
		this.render();
	}

	render() {
		this.shadowRoot.innerHTML = templateHTML(this);
	}
}
customElements.define('not-found', NotFound);
