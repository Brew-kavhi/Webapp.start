class PasswordDialog extends HTMLElement {
	private dialog: HTMLDialogElement;

	constructor() {
		super();
		const shadow = this.attachShadow({ mode: 'open' });

		// Create dialog element
		this.dialog = document.createElement('dialog');
		this.dialog.style.height = 'fit-content';
		this.dialog.style.maxWidth = '60%';
		this.dialog.innerHTML = `
            <form method="dialog" class='card-body'>
                <label for="password" class='mb-2'>Enter Password:</label>
                <input type="password" id="password" class='form-control' autocomplete='current-password' name="password" placeholder="Password">
                <menu>
                    <button class='btn btn-danger' id="submit_dialog" type="submit">Submit</button>
                    <button class='btn btn-outline-primary' type="reset">Cancel</button>
                </menu>
            </form>
<style>
      @import url('/node_modules/bootstrap/dist/css/bootstrap.min.css');
	dialog::backdrop {
		background: #3b333382;
}
    </style>
        `;

		shadow.appendChild(this.dialog);
		// Event listener for form submission
		this.dialog.querySelector('form').addEventListener('submit', (event) => {
			event.preventDefault();
			this.handleClose();
		});
		this.dialog
			.querySelector('button[type="reset"]')!
			.addEventListener('click', (event: any) => {
				event.preventDefault();
				this.dialog.close();
				this.dialog.classList.remove('card');
			});
	}

	setText(text: string) {
		this.dialog.querySelector('label[for="password"]').innerText = text;
	}

	// Method to open the dialog
	openDialog() {
		this.dialog.querySelector('#password').value = '';
		this.dialog.showModal();
		this.dialog.classList.add('card');
	}

	// Method to close the dialog and dispatch the password
	handleClose() {
		const password = this.dialog.querySelector('#password')!.value;
		this.dialog.close();
		this.dialog.classList.remove('card');

		// Dispatch custom event with the password value
		this.dispatchEvent(
			new CustomEvent('password-submitted', {
				detail: { password },
				bubbles: true, // Allow the event to bubble up to other components
				composed: true, // Allow event to pass through shadow DOM
			})
		);
	}
}

customElements.define('password-dialog', PasswordDialog);
