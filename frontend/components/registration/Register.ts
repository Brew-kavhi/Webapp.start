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
import { FormComponent } from '/components/utils/FormComponent.ts';
import { TemplatedComponent } from '/components/utils/TemplatedComponent';
import { USER_API_HOST } from '/js/const/host';
import templateHTML from 'virtual:components/registration/register';

class Register extends TemplatedComponent {
	private configuration: Configuration;
	private userAPI: UserAPI;
	private form: FormComponent;
	private fields: Array<FieldScheme>;

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
				label: i18next.t('models.user.name'),
				type: InputType.Text,
				required: true,
			},
			{
				name: 'lastName',
				label: i18next.t('models.user.last_name'),
				type: InputType.Text,
				required: true,
			},
			{
				name: 'email',
				label: i18next.t('models.user.email'),
				type: InputType.Email,
				required: true,
			},
			{
				name: 'password',
				label: 'Password',
				type: InputType.PassworConfirmation,
				required: true,
			},
		];
	}

	connectedCallback() {
		this.render();
	}

	render() {
		this.shadowRoot!.innerHTML = templateHTML(this);
		this.form = document.createElement('form-component');
		this.form.setFields(this.fields);
		this.shadowRoot.appendChild(this.form);
		let template = this.shadowRoot?.getElementById('register-form-template');
		this.form.setHTML(template.innerHTML);
		this.form.setDataScheme(User);
		this.shadowRoot.addEventListener('form-submitted', this);
		this.form.addBootstrap();
	}

	async handleEvent(e) {
		if (e.type == 'form-submitted') {
			e.preventDefault();
			var user = e.detail;
			this.userAPI
				.createUser(user)
				.then((response) => {
					if (response.status == 201) {
						toast.success('Success', 'Your registration was successful. We are happy you join our team!');
						window.location.href = '/';
					}
				})
				.catch((error) => {
					if (error.status == 404) {
						toast.error('Error','A user with this email already exists!');
					} else {
						toast.error("Error", "Something went wrong. We are very sorry!");
					}
					console.log(error);
				});
		}
	}
}
customElements.define('register-page', Register);
