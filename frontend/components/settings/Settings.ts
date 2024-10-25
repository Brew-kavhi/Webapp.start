/* This is the Component to display a coffee in a list as a card.
 * This code is part of the Brew.Kahvi frontend.
 *
 * Author: Marius Goehring
 * Website: mariusgoehring.de
 * E-Mail: kavhi@mariusgoehring.de
 *
 * Version: 0.0.1
 * License: MIT
 * Copyright Marius Goehring
 */
import { TemplatedComponent } from '/components/utils/TemplatedComponent.ts';

class Settings extends TemplatedComponent {
	constructor() {
		super();
		Settings.templateFile = '/components/settings/settings.html';
	}

	connectedCallback() {
		this.loadTemplate(Settings).then(() => this.render());
	}

	render() {
		this.shadowRoot.innerHTML = this.prepareHTML(Settings);
	}
}
customElements.define('settings-page', Settings);
