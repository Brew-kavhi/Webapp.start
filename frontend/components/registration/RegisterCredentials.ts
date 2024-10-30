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
import { registerUserBiometricCredentials } from '/js/pwa.ts';
import { USER_API_HOST } from '/js/const/host.ts';
import templateHTML from '/components/registration/register-credentials.html';

class RegisterCredentials extends TemplatedComponent {
	constructor() {
		super();
	}

	connectedCallback() {
		this.render();
	}

	render() {
		this.shadowRoot.innerHTML = this.dynamicHTML(templateHTML);
		this.shadowRoot.addEventListener('click', this);
	}

	async handleEvent(e) {
		if (e.target.id == 'registerButton') {
			registerUserBiometricCredentials(
				`${USER_API_HOST}/auth/register/challenge`,
				`${USER_API_HOST}/auth/register`
			);
		}
	}
}
customElements.define('register-credentials', RegisterCredentials);
