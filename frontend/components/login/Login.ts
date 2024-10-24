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
import { authenticateUserBiometricCredentials } from '/js/pwa.ts';
import { USER_API_HOST } from '/js/const/host.ts';

class Login extends TemplatedComponent {
	constructor() {
		super();
		Login.templateFile = '/components/login/login.html';
	}

	connectedCallback() {
		this.loadTemplate(Login).then(() => this.render());
	}

	render() {
		this.shadowRoot.innerHTML = this.prepareHTML(Login);
		this.addBootstrap();
		this.shadowRoot.addEventListener('click', this);
		this.shadowRoot.addEventListener('submit', this);
	}

	async handleEvent(e) {
		if (e.target.id == 'loginButton' && e.type == 'click') {
			e.stopPropagation();
			e.preventDefault();
			const username = this.shadowRoot.getElementById('username').value;
			const response = await authenticateUserBiometricCredentials(
				`${USER_API_HOST}/auth/login/challenge`,
				`${USER_API_HOST}/auth/login`,
				username
			);
		} else if (e.target.id == 'login-form' && e.type == 'submit') {
			e.preventDefault();
			const username = this.shadowRoot.getElementById('username').value;
			const password = this.shadowRoot.getElementById('password').value;

			// Send registration request
			const response = await fetch(`${USER_API_HOST}/auth/login/password`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password }),
			});

			if (response.ok) {
				window.location.href = '/';
				//document.getElementsByTagName('auth-check')[0].render();
			} else {
				alert('Login failed');
			}
		}
	}
}
customElements.define('login-page', Login);
