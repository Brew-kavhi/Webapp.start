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
import templateHTML from 'virtual:components/login/password_reset_token';
import { FieldScheme, InputType } from '../../js/types/FieldScheme';

export class PasswordResetToken extends TemplatedComponent {
	private passwordInput: HTMLElement;
	private passwordField: FieldScheme;

	constructor() {
		super();
		this.passwordField = {
			name: 'password',
			label: 'pasword',
			type: InputType.PassworConfirmation,
			required: true
		};
	}

	connectedCallback() {
		this.render();
	}

	render() {
		this.shadowRoot.innerHTML = templateHTML(this);
		// replace slot-anem ith the password input
		this.passwordInput = document.createElement('input-field');
		this.passwordInput.field = this.passwordField;
		var slot = this.shadowRoot?.querySelector(
			`div[slot-name="password"]`
		);
		slot?.appendChild(this.passwordInput);
		this.addBootstrap();
		this.shadowRoot.addEventListener('submit', this);
	}

	async handleEvent(e) {
		if (e.target.id == 'password_form' && e.type == 'submit') {
			e.preventDefault();
			this.checkToken();
		}
	}

	checkToken() {
		if (this.passwordInput.validate()) {
			const password = this.passwordInput.value;
			console.log(password);
			const queryString = window.location.search;
			const urlParams = new URLSearchParams(queryString);
			const email = urlParams.get("email");
			if (!email) {
				return;
			}
			fetch(`${USER_API_HOST}/user/validatepasswordtoken${queryString}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ username: email, password: password }),
			}).then((response) =>{
				if (response.status == 200) {
					toast.success("Success", "Successful validation");
					console.log(response);
				} else if(response.status == 404) {
					// email is worong
					toast.error("Error", "Something went wrong, check if you entered the right credential");
				} else if(response.status == 401) {
					// invalid token
					toast.error("Error", "the token is not valid");
				}
			}).catch((error) =>{});
		}
	}
}
customElements.define('reset-token', PasswordResetToken);
