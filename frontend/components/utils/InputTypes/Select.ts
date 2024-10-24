export class SelectInput extends HTMLElement {
	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this._options = JSON.parse(this.getAttribute('options') || '[]');
		this.render();
	}

	connectedCallback() {
		this.shadowRoot
			.querySelector('select')
			.addEventListener('change', (event) => this.onSelect(event));
	}

	disconnectedCallback() {
		this.shadowRoot
			.querySelector('select')
			.removeEventListener('change', this.onSelect);
	}

	render() {
		const optionsMarkup = this._options
			.map((option) => `<option value="${option.value}">${option.label}</option>`)
			.join('');

		this.shadowRoot.innerHTML = `
            <style>
                select {
		    padding: .375rem .75rem;
		    font-size: 1rem;
		    line-height: 1.5;
		    width: 100%;
		    border-radius: 5px;
		    background: white;
		    border: 1px solid lightgray;
                }
            </style>
            <label>
                <slot name="label"></slot>
                <select>
                    ${optionsMarkup}
                </select>
            </label>
        `;
	}

	get validity() {
		const select = this.shadowRoot?.querySelector('select');
		return select?.validity;
	}

	// Event handler when the selection changes
	onSelect(event) {
		const selectEvent = new CustomEvent('valueChanged', {
			detail: { value: event.target.value },
			bubbles: true,
			composed: true,
		});
		this.dispatchEvent(selectEvent);
	}

	// Method to dynamically set options
	set options(newOptions) {
		this._options = newOptions;
		this.render();
	}

	// Getter to retrieve the selected value
	get value() {
		return this.shadowRoot.querySelector('select').value;
	}

	// Setter to programmatically set the selected value
	set value(newValue) {
		this.shadowRoot.querySelector('select').value = newValue;
	}
}

customElements.define('select-input', SelectInput);
