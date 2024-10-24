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
import { USER_API_HOST } from '/js/const/host.ts';

class Logout extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._logout();
	}

	render() {
		this.shadowRoot.innerHTML = 'logging out';
	}

	connectedCallback() {
		this.render();
	}

	async _logout() {
		const response = await fetch(`${USER_API_HOST}/auth/logout`, {
			method: 'POST',
			credentials: 'include', // Ensure cookies are sent and received
		});

		if (response.ok) {
			// Successfully logged out
			// Redirect to the login page or remove the protected content
			window.router.loadRoute('login');
		} else {
			// Handle error (e.g., user already logged out, or server error)
			alert('Failed to log out. Please try again.');
		}
	}
}
customElements.define('logout-page', Logout);
