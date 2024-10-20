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
import {
	registerUserBiometricCredentials,
	authenticateUserBiometricCredentials,
} from '/js/pwa.ts';
import { USER_API_HOST } from '/js/const/host.ts';

class Register extends TemplatedComponent {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		Register.templateFile = '/components/registration/register.html';
	}

	connectedCallback() {
		this.loadTemplate(Register).then(() => this.render());
	}

	render() {
		this.shadowRoot.innerHTML = this.prepareHTML(Register);
		this.shadowRoot.addEventListener('click', this);
	}

	handleEvent(e) {
		if (e.target.id == 'registerButton') {
			const username = this.shadowRoot.getElementById('username').value;
			registerUserBiometricCredentials(
				`${USER_API_HOST}/auth/register/challenge`,
				`${USER_API_HOST}/auth/register`,
				username
			);
		} else if (e.target.id == 'loginButton') {
			const username = this.shadowRoot.getElementById('username').value;
			authenticateUserBiometricCredentials(
				`${USER_API_HOST}/auth/login/challenge`,
				`${USER_API_HOST}/auth/login`,
				username
			);
		}
	}
}
customElements.define('register-page', Register);
