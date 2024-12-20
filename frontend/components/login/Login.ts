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
import templateHTML from 'virtual:components/login/login';

class Login extends TemplatedComponent {
	constructor() {
		super();
	}

	connectedCallback() {
		this.render();
	}

	render() {
		this.shadowRoot.innerHTML = templateHTML(this); 
		this.addBootstrap();
		this.shadowRoot.addEventListener('click', this);
		this.shadowRoot.addEventListener('submit', this);
	}

	async handleEvent(e) {
		if (e.target.tagName == 'SL-ICON' && e.type == 'click') {
			e.stopPropagation();
			e.preventDefault();
			const username = this.shadowRoot.getElementById('username').value;
			const response = await authenticateUserBiometricCredentials(
				`${USER_API_HOST}/auth/login/challenge`,
				`${USER_API_HOST}/auth/login`,
				username
			);
			if (response.ok) {
				window.router.loadUrl('/');
			} else {
				toast.error("Error", "Login failed");
			}
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
				let data = await response.json();
				let displayName: string = data['displayName'];
				localStorage.setItem('displayName', displayName);
				if (response.redirected) {
					const redirectUrl = response.url;
					toast.success("Login succesfull", "You are redirected");
					router.loadUrl(redirectUrl.replace(window.location.origin,''));
				} else {
					toast.success("Success", "Login succesfull");
					router.loadUrl("/");
				}
			} else {
				if (response.status == 404) {
					toast.error("Login failed", "We cannot find this username");
				} else {
					toast.error("Error", "Login failed");
				}
			}
		}
	}
}
customElements.define('login-page', Login);
