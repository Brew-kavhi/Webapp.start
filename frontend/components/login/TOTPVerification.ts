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
import { USER_API_HOST } from '/js/const/host.ts';
import templateHTML from '/components/login/totp_verification.html';

class TOTPVerification extends TemplatedComponent {
	constructor() {
		super();
	}

	connectedCallback() {
		this.render();
	}

	render() {
		this.shadowRoot.innerHTML = this.dynamicHTML(templateHTML);
		this.addBootstrap();
		this.shadowRoot.addEventListener('submit', this);
		this.shadowRoot.getElementById("totp-code").addEventListener("input", this.inputCode);
	}

	inputCode(e) {
		e.target.value = e.target.value.replace(/\D/g, '');
	}

	async handleEvent(e) {
		if (e.target.id == 'verification-form' && e.type == 'submit') {
			e.preventDefault();
			const code = this.shadowRoot.getElementById('totp-code').value;

			// Send registration request
			const response = await fetch(`${USER_API_HOST}/auth/validatetotp`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				withCredentials: true,
				body: JSON.stringify({"totp_code":code }),
			});
			console.log(response);

			if (response.ok) {
				console.log(response);
				if (response.redirected) {
					const redirectUrl = response.url;
					window.router.loadUrl(redirectUrl.replace(window.location.origin,''));
				} else {
					window.location.href='/';
				}
			} else {
				alert('Login failed');
			}
		}
	}
}
customElements.define('totp-verification', TOTPVerification);
