import { InputType } from '/js/types/FieldScheme';
import { FieldScheme } from '/js/types/FieldScheme';

// password-input.js
export class InputComponent extends HTMLElement {
	private _field: FieldScheme;
	private errorMessage: HTMLSpanElement;
	private input: HTMLInputElement;
	private container: HTMLDivElement;
	private shadow;

	constructor(field: FieldScheme) {
		super();
		this.shadow = this.attachShadow({ mode: 'open' });
		this._field = field;
	}

	connectedCallback() {
		this.render();
	}

	set field(value: FieldScheme) {
		this._field = value;
		this.render();
	}

	render() {
		this.shadowRoot.innerHTML = '';
		this.container = document.createElement('div');
		if (!this._field) {
			return;
		}
		this.container.setAttribute('slot', this._field.name);

		switch (this._field.type) {
			case InputType.Interval:
				import('/components/utils/InputTypes/Interval.ts');
				this.input = document.createElement('interval-input');
				var label = document.createElement('label');
				label.innerText = this._field.label;
				this.container.appendChild(label);
				break;
			case InputType.Select:
				import('/components/utils/InputTypes/Select.ts');
				this.input = document.createElement('select-input');
				this.input.setAttribute('options', JSON.stringify(this._field.options));
				var label = document.createElement('label');
				label.innerText = this._field.label;
				this.container.appendChild(label);
				break;
			case InputType.PassworConfirmation:
				import('/components/utils/InputTypes/PasswordConfirmation.ts');
				this.input = document.createElement('password-confirmation');
				break;
			case InputType.Phone:
				import('/components/utils/InputTypes/Phone.ts');
				this.input = document.createElement('phone-input');
				var label = document.createElement('label');
				label.innerText = this._field.label;
				this.container.appendChild(label);
				break;
			default:
				// render input element with adccording type
				this.input = document.createElement('input');

				this.input.setAttribute('type', this._field.type);
				this.input.setAttribute('name', this._field.name);
				this.input.setAttribute('autocomplete', this._field.autocomplete);
				this.input.setAttribute('placeholder', this._field.label);
				if (this._field.required) {
					this.input.setAttribute('required', '');
				}
				if (this._field.minlength) {
					this.input.setAttribute('minlength', this._field.minlength);
				}
				if (this._field.min) {
					this.input.setAttribute('min', this._field.min);
				}
				if (this._field.max) {
					this.input.setAttribute('max', this._field.max);
				}
				let style = document.createElement('style');
				style.innerHTML = `
					input {
						border: 1px solid lightgray;
					    border-radius: 5px;
					    line-height: 1.5;
					    padding: .375rem .75rem;
						width: -webkit-fill-available;
					    font-size: 1rem;
					}
				`;
				this.shadowRoot?.appendChild(style);
				break;
		}

		this.errorMessage = document.createElement('span');
		this.errorMessage.style.color = 'red';
		this.errorMessage.style.display = 'none';
		this.errorMessage.textContent = 'Password must be at least 6 characters.';

		this.container.appendChild(this.input);
		this.container.appendChild(this.errorMessage);
		this.shadow.appendChild(this.container);
	}

	// Custom validation method
	validate() {
		this.clearError();
		let valid: boolean = true;
		if (this._field.validate) {
			valid = false;
			let msg: string;
			[valid, msg] = this._field.validate(this.input.value);
			if (!valid) {
				this.errorMessage.textContent = msg;
				this.errorMessage.style.display = 'block';
			}
		}
		if (!this.input.validity) {
			console.log(this);
			return valid && true;
		}
		if (!this.input.validity.valid) {
			if (this.input.validity.tooShort) {
				this.errorMessage.textContent = `Input must be at least ${this._field.minlength} characters.`;
			} else if (this.input.validity.valueMissing) {
				this.errorMessage.textContent = '_Field is required.';
			}
			this.errorMessage.style.display = 'block';
			return false;
		}

		return valid && true;
	}

	// Clear the error message
	clearError() {
		this.errorMessage.style.display = 'none';
	}

	// Return the current input value
	get value() {
		return this.input.value;
	}

	set value(value: string) {
		this.input.value = value;
	}
}

customElements.define('input-field', InputComponent);
