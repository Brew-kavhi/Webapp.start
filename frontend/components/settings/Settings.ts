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
import templateHTML from 'virtual:components/settings/settings';

class Settings extends TemplatedComponent {
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
customElements.define('settings-page', Settings);
