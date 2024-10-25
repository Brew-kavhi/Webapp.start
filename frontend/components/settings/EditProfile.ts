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
	}

	connectedCallback() {
		this.render();
	}

	render() {
		this.userAPI.getUser().then((response)=>{
			if (response.data) {
				this.form.setValues(response.data);
			} else {
				console.log("error in getting user data");
				console.log(response);
			}
		}).catch((error)=>{
				console.log(error);
		});
		this.shadowRoot.innerHTML = this.dynamicHTML(templateHTML);
		this.form = document.createElement('form-component') as FormComponent;
		this.form.setFields(this.fields);
		this.shadowRoot.appendChild(this.form);
		let template = this.shadowRoot?.getElementById('edit-profile-template');
		this.form.setHTML(template.innerHTML);
		this.form.setDataScheme(User);
		this.shadowRoot.addEventListener('form-submitted', this);
		this.shadowRoot.addEventListener('form-submitted', this);
	}

	handleEvent(e) {
		var user = e.detail;
		console.log(user);
		// store user in the backend
		this.userAPI.updateUser(user).then((response)=>{
			alert('success');
		}).catch((error)=>{
				console.log(error);
		});
	}
}
customElements.define('edit-profile', EditProfile);
