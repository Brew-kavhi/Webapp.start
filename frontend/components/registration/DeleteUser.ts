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
import { TemplatedComponent } from '/components/utils/TemplatedComponent.ts';
import { Configuration } from '../../client_api';
import { UserAPI } from '../../client_api/userModel';
import { USER_API_HOST } from '/js/const/host';
import templateHTML from '/components/registration/delete_user.html';

class DeleteUser extends TemplatedComponent {
	private configuration: Configuration;
	private userAPI: UserAPI;

	constructor() {
		super();
		this.configuration = new Configuration({
			basePath: USER_API_HOST,
			baseOptions: {
				withCredentials: true,
			},
		});
		this.userAPI = new UserAPI(this.configuration);
		document.addEventListener('password-submitted', this);
	}

	connectedCallback() {
		this.render();
	}

	render() {
		this.shadowRoot.innerHTML = templateHTML;
		this.addBootstrap();
		this.addIcons();
		this.shadowRoot!.addEventListener('click', this);
	}

	async handleEvent(e) {
		if (e.target.id == 'delete_profile') {
			const passwordDialog = this.shadowRoot.querySelector('password-dialog');
			if (passwordDialog) {
				passwordDialog.setText('Confirm deletion by entering your password below');
				passwordDialog.openDialog(); // Open the dialog via the method
			}
		} else if (e.type == 'password-submitted') {
			const { password } = e.detail;
			if (password == null || password == '') {
				toast.success("Success", "We are happy you are staying with us!");
			} else {
				this.userAPI
					.deleteUser({ password: password })
					.then((response) => {
						toast.success("Success", "Your account has been deleted!");
						console.log(response);
					})
					.catch((error) => {
						toast.error("Error", error);
						console.log(error);
					});
			}
		}
	}
}
customElements.define('delete-user', DeleteUser);
