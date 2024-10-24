export class PhoneInput extends HTMLElement {
	private _valid: boolean = false;
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });

		this.render();
	}

	get validity(): boolean {
		const phoneInput = this.shadowRoot.querySelector('input');
		return phoneInput.validity;
	}

	connectedCallback() {
		this.shadowRoot
			.querySelector('input')
			.addEventListener('input', () => this.validatePhoneNumber());
		this.shadowRoot
			.querySelector('select')
			.addEventListener('change', () => this.validatePhoneNumber());
	}

	disconnectedCallback() {
		this.shadowRoot
			.querySelector('input')
			.removeEventListener('input', this.validatePhoneNumber);
		this.shadowRoot
			.querySelector('select')
			.removeEventListener('change', this.validatePhoneNumber);
	}

	render() {
		this.shadowRoot.innerHTML = `
            <style>
                .phone-input {
                    display: flex;
                    align-items: center;
			width: fit-content;
			border-radius: 5px;
			border: 1px solid lightgrey;
                }
                .phone-input select, .phone-input input {
                    font-size: 1rem;
                    padding: 5px;
			background: white;
			border: 0px;
                }
		.phone-input select {
		    border-top-left-radius: 5px;
		    border-bottom-left-radius: 5px;
			border-right: 0px;
			width: max-content;
		}
		.phone-input input {
		    border-top-right-radius: 5px;
		    border-bottom-right-radius: 5px;
			border-left: 0px;
			padding: 6px;
		}
		select,input:focus-visible {
			outline-width: 0px;
		}
		.phone-input:focus-within {
			border: 1px solid gray;
		}		
                .error {
                    color: red;
                    font-size: 0.8rem;
                    display: none;
                }
            </style>
            <div class="phone-input">
                <select>
                    ${this.getCountryOptions()}
                </select>
                <input type="tel" placeholder="Phone number" />
            </div>
            <div class="error">Invalid phone number</div>
        `;
	}

	// Method to generate country options (add more as needed)
	getCountryOptions() {
		return `
            <option value="+1">USA (+1)</option>
            <option value="+44">UK (+44)</option>
            <option value="+49">Germany (+49)</option>
            <option value="+33">France (+33)</option>
            <option value="+61">Australia (+61)</option>
            <option value="+91">India (+91)</option>
            <!-- Add more countries -->
        `;
	}

	// Basic phone number validation
	validatePhoneNumber() {
		const phoneInput = this.shadowRoot.querySelector('input');
		const countryCode = this.shadowRoot.querySelector('select').value;
		const fullPhoneNumber = `${countryCode} ${phoneInput.value}`;

		const isValid = this.isValidPhoneNumber(fullPhoneNumber);

		if (isValid) {
			this.shadowRoot.querySelector('.error').style.display = 'none';
			phoneInput.setCustomValidity('');
		} else {
			this.shadowRoot.querySelector('.error').style.display = 'block';
			phoneInput.setCustomValidity('Invalid phone number');
		}
	}

	// Placeholder for real phone number validation logic
	isValidPhoneNumber(phoneNumber) {
		// You can replace this with proper validation logic (e.g., using libphonenumber-js)
		const regex = /^[+]\d{1,4} \d{7,15}$/;
		return regex.test(phoneNumber);
	}

	// Getter to retrieve the phone number
	get value() {
		const phoneInput = this.shadowRoot.querySelector('input');
		const countryCode = this.shadowRoot.querySelector('select').value;
		return `${countryCode} ${phoneInput.value}`;
	}
}

customElements.define('phone-input', PhoneInput);
