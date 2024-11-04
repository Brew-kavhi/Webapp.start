/*t as a card.
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
import templateHTML from 'virtual:components/login/reset_password';

export class ResetPassword extends TemplatedComponent {
	constructor() {
		super();
	}

	connectedCallback() {
		this.render();
	}

	render() {
		this.shadowRoot.innerHTML = templateHTML(this);
		this.addBootstrap();
		this.shadowRoot.addEventListener('submit', this);
	}

	async handleEvent(e) {
		if (e.target.id == 'reset-form' && e.type == 'submit') {
			e.preventDefault();
			const username = this.shadowRoot.getElementById('username').value;

			// Send registration request
			const response = await fetch(`${USER_API_HOST}/user/reset_password`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username }),
			});
			console.log(response);

			if (response.ok) {
				toast.success("Success", "Password reset");
				window.location.href = '/';
			} else {
				if (response.status == 404) {
					toast.error("Error", "Sorry, we cannot find a user with this email.");
					this.shadowRoot.querySelector('#error-message').innerHTML="Error";
				} else {
					toast.error("Error", "Password reset did not work");
				}
			}
		}
	}
}
customElements.define('reset-password', ResetPassword);
