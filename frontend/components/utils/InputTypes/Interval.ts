export class IntervalInput extends HTMLElement {
	private intervalBegin: Number;
	private intervalEnd: Number;

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });

		// Set default attributes
		this.intervalBegin = Number(this.getAttribute('interval-begin')) || 0;
		this.intervalEnd = Number(this.getAttribute('interval-end')) || 100;

		this.render();
	}

	connectedCallback() {
		this.shadowRoot.querySelectorAll('input').forEach((input) => {
			input.addEventListener('input', () => this.validateInterval());
		});
	}

	disconnectedCallback() {
		this.shadowRoot.querySelectorAll('input').forEach((input) => {
			input.removeEventListener('input', this.validateInterval);
		});
	}

	render() {
		this.shadowRoot.innerHTML = `
            <style>
                .interval-input-container {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                .interval-input-container input {
                    padding: 5px;
                    font-size: 1rem;
                    width: 100px;
                }
                .error {
                    color: red;
                    font-size: 0.8rem;
                    display: none;
                }
            </style>
            <div class="interval-input-container">
                <label>
                    Begin: <input type="number" value="${this.intervalBegin}" name="intervalBegin" />
                </label>
                <label>
                    End: <input type="number" value="${this.intervalEnd}" name="intervalEnd" />
                </label>
            </div>
            <div class="error">Interval begin must be less than or equal to interval end.</div>
        `;
	}

	// Validate that intervalBegin <= intervalEnd
	validateInterval() {
		const beginInput = this.shadowRoot.querySelector(
			'input[name="intervalBegin"]'
		);
		const endInput = this.shadowRoot.querySelector('input[name="intervalEnd"]');

		const intervalBegin = parseFloat(beginInput.value);
		const intervalEnd = parseFloat(endInput.value);

		if (intervalBegin > intervalEnd) {
			this.shadowRoot.querySelector('.error').style.display = 'block';
			beginInput.setCustomValidity('Invalid interval');
			endInput.setCustomValidity('Invalid interval');
		} else {
			this.shadowRoot.querySelector('.error').style.display = 'none';
			beginInput.setCustomValidity('');
			endInput.setCustomValidity('');
		}
	}

	get validity() {
		const beginInput = this.shadowRoot.querySelector(
			'input[name="intervalBegin"]'
		);
		return beginInput.validity;
	}

	get value() {
		return [this.begin, this.end];
	}

	// Getters to retrieve the interval values
	get begin() {
		return parseFloat(
			this.shadowRoot.querySelector('input[name="intervalBegin"]').value
		);
	}

	get end() {
		return parseFloat(
			this.shadowRoot.querySelector('input[name="intervalEnd"]').value
		);
	}

	// Setters to programmatically update the interval values
	set begin(value) {
		this.shadowRoot.querySelector('input[name="intervalBegin"]').value = value;
		this.validateInterval();
	}

	set end(value) {
		this.shadowRoot.querySelector('input[name="intervalEnd"]').value = value;
		this.validateInterval();
	}
}

customElements.define('interval-input', IntervalInput);
