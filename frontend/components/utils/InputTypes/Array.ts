export class ArrayInput extends HTMLElement {
	private values: Array = [];
	private _itemType = 'text';

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });


		this.render();
	}

	render() {
		this.shadowRoot.innerHTML = `
            <style>
                .input-container {
                    display: grid;
                    align-items: center;
                    gap: 10px;
                }
                .input-container input {
                    padding: .375rem .75rem;
                    font-size: 1rem;
			line-height: 1.5;
			border-radius: 5px;
			border: 1px solid lightgray;
                }
                .error {
                    color: red;
                    font-size: 0.8rem;
                    display: none;
                }
		#inputs {
			display: contents;			
		}
		#inputs input {

            </style>
            <div class="input-container">
		<div id="inputs"></div>
		<button id="addInput">+ ${i18next.t('form.inputs.add')}</button>
            </div>
            <div class="error">Interval begin must be less than or equal to interval end.</div>
        `;
		this.inputsContainer = this.shadowRoot.querySelector('#inputs');
                this.addInputButton = this.shadowRoot.querySelector('#addInput');
		this.addInputButton.addEventListener('click', () => {
			this.addInputField();
		});
	}

	get validity() {
		return {"valid": true};
	}

	set itemType(type: string) {
		this._itemType = type;
	}

	addInputField() {
                const newInput = document.createElement('input');
                newInput.type = this._itemType;
                newInput.placeholder = 'Enter item';
                this.inputsContainer.appendChild(newInput);
        }

            // Return the list of values in the inputs
	get value() {
		const inputs = this.shadowRoot.querySelectorAll('input');
		const values: Array = [];
		inputs.forEach(input => {
		    if (input.value.trim() !== '') {
			values.push(input.value.trim());
		    }
		});
		return values;
	}
	
	set value(value: array) {
		console.error("Array input set value method not yet implmented");
		// basically iterate over all the element and the create the element and the value to its corresponding element.
	}

}

customElements.define('array-input', ArrayInput);
