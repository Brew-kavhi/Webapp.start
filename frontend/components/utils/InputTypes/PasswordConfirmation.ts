export class PasswordConfirmation extends HTMLElement {
	private valid: boolean = false;

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.render();
	}

	connectedCallback() {
		this.shadowRoot
			.querySelector('#password')
			.addEventListener('input', () => this.validatePasswords());
		this.shadowRoot
			.querySelector('#confirm-password')
			.addEventListener('input', () => this.validatePasswords());
	}

	validatePasswords() {
		const password = this.shadowRoot.querySelector('#password').value;
		const confirmPassword =
			this.shadowRoot.querySelector('#confirm-password').value;
		const messageElement = this.shadowRoot.querySelector('.error-message');

		if (password && confirmPassword && password !== confirmPassword) {
			messageElement.textContent = 'Passwords do not match!';
			messageElement.style.color = 'red';
			this.valid = false;
		} else {
			messageElement.textContent = '';
			this.valid = true;
		}
	}

	render() {
		this.shadowRoot.innerHTML = `
            <style>
                .error-message {
                    font-size: 0.9rem;
                    margin-top: 5px;
                }
                input {
                    display: block;
                    margin-bottom: 10px;
                    padding: .375rem .75rem;
			line-height: 1.5;
                    font-size: 1rem;
			border: 1px solid lightgray;
			border-radius: 5px;
			width: -webkit-fill-available;
                }
		label { 
			flex: 1 0 0%;
		} 
		.container {
			display: flex;
			gap: var(--bs-gutter-x);
		}
            </style>
		<div class='container'>
			<input placeholder="Password" autocomplete='new-password' type="password" id="password" required />
			<input placeholder="Confirm Password" autocomplete='new-password' type="password" id="confirm-password" required />
		</div>
	    <div class="error-message"></div>
        `;
	}

	get validity() {
		return { valid: this.valid };
	}

	// Getters for the password values
	get password() {
		return this.shadowRoot.querySelector('#password').value;
	}

	get value() {
		return this.shadowRoot.querySelector('#password').value;
	}

	get confirmPassword() {
		return this.shadowRoot.querySelector('#confirm-password').value;
	}
}

// Define the custom element
customElements.define('password-confirmation', PasswordConfirmation);
