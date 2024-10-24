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

class DeleteUser extends TemplatedComponent {
	private configuration: Configuration;
	private userAPI: UserAPI;

	constructor() {
		super();
		DeleteUser.templateFile = '/components/registration/delete_user.html';
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
		this.loadTemplate(DeleteUser).then(() => this.render());
	}

	render() {
		this.shadowRoot!.innerHTML = this.prepareHTML(DeleteUser);
		this.addBootstrap();
		this.addIcons();
		this.shadowRoot!.addEventListener('click', this);
	}

	async handleEvent(e) {
		if (e.target.id == 'delete_profile') {
			// TODO: replace prompt with password hidden dialog
			const passwordDialog = this.shadowRoot.querySelector('password-dialog');
			if (passwordDialog) {
				passwordDialog.setText('Confirm deletion by entering your password below');
				passwordDialog.openDialog(); // Open the dialog via the method
			}
		} else if (e.type == 'password-submitted') {
			const { password } = e.detail;
			if (password == null || password == '') {
				alert('We are very happy ypu are staying with us');
			} else {
				this.userAPI
					.deleteUser({ password: password })
					.then((response) => {
						console.log(response);
					})
					.catch((error) => {
						console.log(error);
					});
			}
		}
	}
}
customElements.define('delete-user', DeleteUser);
