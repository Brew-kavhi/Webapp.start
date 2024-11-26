/* This is the Component to display a Form
 * This code is part of the webapp-start framework.
 *
 * Author: Marius Goehring
 * Website: mariusgoehring.de
 * E-Mail: kavhi@mariusgoehring.de
 *
 * Version: 0.0.1
 * License: MIT
 * Copyright Marius Goehring
 */

import { FieldScheme } from '/js/types/FieldScheme';
import { InputComponent } from '/components/utils/InputComponent.ts';
import { TemplatedComponent } from './TemplatedComponent';

export class FormComponent extends TemplatedComponent {
	private dataScheme: new () => T;
	private innerHTML: string;
	private dataFields: Array<FieldScheme>;
	private formValidation: (values: any) => [boolean, string] = () => [true, ''];
	private inputs: Map<string, InputComponent>;

	constructor() {
		super();
		this.inputs = new Map();
	}

	setHTML(code: string) {
		this.innerHTML = code;
		this.renderForm();
	}

	connectedCallback() {
		this.renderForm();
	}

	renderForm() {
		if (this.innerHTML) {
			this.shadowRoot.innerHTML = this.innerHTML;
			this.dataFields.forEach((element: FieldScheme) => {
				var input = document.createElement('input-field');
				input.field = element;
				this.inputs[element.name] = input;
				var slot = this.shadowRoot?.querySelector(
					`div[slot-name="${element.name}"]`
				);
				slot?.appendChild(input);
			});
		} else {
			this.shadowRoot.innerHTML = `<form></form>`;
			let form = this.shadowRoot?.querySelector('form');
			this.dataFields.forEach((element: FieldScheme) => {
				var input = document.createElement('input-field');
				input.field = element;
				this.inputs[`${element.name}`] = input;
				form?.appendChild(input);
			});
			let submitBtn = document.createElement('input');
			submitBtn.setAttribute('type', 'submit');
			submitBtn.innerText = 'Submit';
			form?.appendChild(submitBtn);
			let style = document.createElement('style');
			style.innerHTML = `
				input[type='submit'] {
					border-radius: 5px;
					padding: .375rem .75rem;
					border: 0;
					line-height: 1.5;
					font-size: 1rem;
				}
			`;
			this.shadowRoot.appendChild(style);
		}
		this.shadowRoot.addEventListener('submit', this);

		// fill the slots with input fields
	}

	setDataScheme(scheme: new () => T) {
		this.dataScheme = scheme;
	}

	setFormValidation(validation: (value: any) => [boolean, string]) {
		this.formValidation = validation;
	}

	setFields(value: Array<FieldScheme>) {
		if (value) {
			this.dataFields = value;
		}
		this.renderForm();
	}

	setValues(value: T) {
		this.dataFields.forEach((element: FieldScheme) => {
			if (value[element.name]) {
				this.inputs[element.name].value = value[element.name];
			}
		});
	}

	validateInputs(): boolean {
		let valid: boolean = false;
		let msg: string;
		let values = {};
		let inputsValid: boolean = true;
		this.dataFields.forEach((element: FieldScheme) => {
			values[element['name']] = this.inputs[element.name].value;
			let inputValid = this.inputs[element.name].validate();
			inputsValid = inputsValid && inputValid;
		});
		[valid, msg] = this.formValidation(values);
		if (!valid) {
			toast.warning("Form invalid", msg);
		}
		return inputsValid;
	}

	handleEvent(e) {
		e.preventDefault();
		// validate all inputs fields
		if (!this.validateInputs()) {
			return;
		}
		//
		// create a new object of type DataScheme.
		var object = new this.dataScheme();
		for (const key in object) {
			if (key in this.inputs) {
				object[key] = this.inputs[key].value;
			}
		}

		this.dispatchEvent(
			new CustomEvent('form-submitted', {
				detail: object,
				bubbles: true, // Allow the event to bubble up to other components
				composed: true, // Allow event to pass through shadow DOM
			})
		);
	}
}

customElements.define('form-component', FormComponent);
