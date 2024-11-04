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
import { User } from '/client_api/userModel';
import { Configuration } from '/client_api';
import { UserAPI } from '/client_api/userModel';
import { FieldScheme, InputType } from '/js/types/FieldScheme';
import { USER_API_HOST } from '/js/const/host';
import { TemplatedComponent } from '/components/utils/TemplatedComponent.ts';
import { FormComponent } from '/components/utils/FormComponent';
import templateHTML from '/components/settings/edit_profile.html';

class EditProfile extends TemplatedComponent {
	private configuration: Configuration;
	private userAPI: UserAPI;
	private form: FormComponent;
	private fields: Array<FieldScheme>;
	private user: User;

	constructor() {
		super();
		this.configuration = new Configuration({
			basePath: USER_API_HOST,
			baseOptions: {
				withCredentials: true,
			},
		});
		this.userAPI = new UserAPI(this.configuration);
		this.fields = [
			{
				name: 'name',
				label: 'Name',
				type: InputType.Text,
				required: true,
			},
			{
				name: 'lastName',
				label: 'Last name',
				type: InputType.Text,
				required: true,
			},
			{
				name: 'email',
				label: 'E-Mail',
				type: InputType.Email,
				required: true,
			},
		];
		document.addEventListener('password-submitted', this);
	}

	connectedCallback() {
		this.render();
	}

	disableTwoFA(e) {
	}

	renderTwoFactorOption() {
		if (!this.user) {
			return;
		}
		if (!this.user['2faenabled']) {
			const button = this.shadowRoot.getElementById('secondfactor');
			if (button) {
				button.classList.remove('d-none');
			}
		} else {
			const secondFactorEnabled = this.shadowRoot.getElementById('secondfactorenabled');
			if (secondFactorEnabled) {
				secondFactorEnabled.classList.remove('d-none');
			}
		}

	}

	render() {
		this.userAPI
			.getUser()
			.then((response) => {
				if (response.data) {
					this.user = response.data as User;
					this.form.setValues(response.data);
					this.renderTwoFactorOption();
				} else {
					console.log('error in getting user data');
					console.log(response);
				}
			})
			.catch((error) => {
				console.log(error);
			});

		this.shadowRoot.innerHTML = this.dynamicHTML(templateHTML);
		const button = this.shadowRoot.getElementById("secondfactor");
		let template = this.shadowRoot?.getElementById('edit-profile-template');
		
		this.form = document.createElement('form-component') as FormComponent;
		this.form.setFields(this.fields);

		this.shadowRoot.getElementById("container").insertBefore(this.form, button);
		this.form.setHTML(template.innerHTML);
		this.form.addBootstrap();
		this.form.setDataScheme(User);

		this.shadowRoot.addEventListener('form-submitted', this);
		this.shadowRoot.addEventListener('form-submitted', this);

		this.shadowRoot.getElementById("secondfactor").addEventListener("click", this);
		this.shadowRoot.getElementById("disable2fa").addEventListener("click", this);
		this.renderTwoFactorOption();
	}

	handleEvent(e) {
		if (e.target.id == 'disable2fa' && e.type == 'click') {
			const passwordDialog = this.shadowRoot.querySelector('password-dialog');
			if (passwordDialog) {
				passwordDialog.setText('Confirm action by entering your password below. Please note, that disabling two factor authentication is not recommended, as it weakens the security of your account.');
				passwordDialog.openDialog(); // Open the dialog via the method
			}

			return;
		} else if (e.type == 'password-submitted') {
			const { password } = e.detail;
			if (password == null || password == '') {
				toast.success("cancelled", "Good choice keeping the two factor authentication enabled!");
			} else {
				e.preventDefault();
				this.userAPI
					.disableTwoFA({ password: password })
					.then((response) => {
						tosat.success('success', "Successfully updated your profile");
						this.renderTwoFactorOption();
					})
					.catch((error) => {
						toast.error("Error", "There was an error during the update");
						console.log(error);
					});
			}
			return;
		} else if (e.type=='click' && e.target.id=='secondfactor') {
			fetch(`${USER_API_HOST}/user/secondfactor`, {
				withCredentials: true
			}).then((response) =>{
				response.json().then((data) => {
					const qrcode = new QRCode(this.shadowRoot.getElementById('qrcode'), {
					  text: data['url'],
					  width: 512, 
					  height: 512, 
					  colorDark : '#000',
					  colorLight : '#fff',
					  correctLevel : QRCode.CorrectLevel.H
					});
				});
			});
			return;
		} else if (e.type == 'form-submitted') {
			var user = e.detail;
			// store user in the backend
			this.userAPI
				.updateUser(user)
				.then((response) => {
					this.render();
					tosat.success('success', "Successfully updated your profile");
				})
				.catch((error) => {
					toast.error("Error", "There was an error during the update");
					console.log(error);
				});
		}
	}
}
customElements.define('edit-profile', EditProfile);
