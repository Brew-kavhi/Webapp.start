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
import { User } from '/client_api/userModel';
import templateHTML from '/components/registration/register.html';

class Register extends TemplatedComponent {
	constructor() {
		super();
			}

	connectedCallback() {
		this.render();
	}

	render() {
		this.shadowRoot.innerHTML = this.dynamicHTML(templateHTML);
		this.addBootstrap();
		let user = new User();
		console.log(Object.keys(user));
		this.shadowRoot.addEventListener('click', this);
		this.shadowRoot.addEventListener('submit', this);
	}

	async handleEvent(e) {
		if (e.target.id == 'registerButton') {
			const username = this.shadowRoot.getElementById('username').value;
			registerUserBiometricCredentials(
				`${USER_API_HOST}/auth/register/challenge`,
				`${USER_API_HOST}/auth/register`,
				username
			);
		} else if (e.target.id == 'register-form' && e.type == 'submit') {
			e.preventDefault();
			const username = this.shadowRoot.getElementById('username').value;
			const password = this.shadowRoot.getElementById('password').value;

			// Send registration request
			const response = await fetch(`${USER_API_HOST}/auth/register/password`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username, password }),
			});

			if (response.ok) {
				alert('User registered successfully!');
			} else {
				alert('Registration failed');
			}
		}
	}
}
customElements.define('register-page', Register);
