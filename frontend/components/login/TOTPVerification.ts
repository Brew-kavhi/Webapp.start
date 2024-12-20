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
import templateHTML from 'virtual:components/login/totp_verification';

class TOTPVerification extends TemplatedComponent {
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
					toast.success("Success", "Verfication was successful.");
					const redirectUrl = response.url;
					window.router.loadUrl(redirectUrl.replace(window.location.origin,''));
				} else {
					toast.success("Success", "Verfication was successful.");
					window.location.href='/';
				}
			} else {
				toast.error('Error', 'Login failed. Please try again');
			}
		}
	}
}
customElements.define('totp-verification', TOTPVerification);
