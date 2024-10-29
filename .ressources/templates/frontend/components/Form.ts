import { Configuration } from '/client_api';
import { ${className}, ${className}Api } from '/client_api/api.ts';
import templateHTML from '/components/${serviceName}/${className}Form.html';
import { FieldScheme, InputType } from '/js/types/FieldScheme';
import { FormComponent } from '/components/utils/FormComponent.ts';
import { ${className}_API_HOST } from '/js/const/host';
import { TemplatedComponent } from '/components/utils/TemplatedComponent';

export class ${className}Form extends TemplatedComponent {
      private configuration: Configuration;
      private api: ${className}API;
      private form: FormComponent;
      private fields: Array<FieldScheme>;

      constructor() {
        super();
        this.configuration = new Configuration({
                basePath: ${className}_API_HOST,
                baseOptions: {
                        withCredentials: true,
                },
        });
        this.api = new ${className}Api(this.configuration);
        this.fields = [
          ${fields.map((field) =>`{
            name: '${field.name}',
            label: '${field.name}',
            type: InputType.Text,
            required: true,
          }`).join(',\n')}
        ];
      }

      connectedCallback() {
        this.render();
      }

      render() {
        this.shadowRoot.innerHTML = this.dynamicHTML(templateHTML);
		this.form = document.createElement('form-component');
		this.form.setFields(this.fields);
		this.shadowRoot.appendChild(this.form);
		let template = this.shadowRoot?.getElementById('${modelName}-form-template');
		this.form.setHTML(template.innerHTML);
		this.form.setDataScheme(${className});
		this.shadowRoot.addEventListener('form-submitted', this);
      }

	async handleEvent(e) {
		if (e.type == 'form-submitted') {
			e.preventDefault();
			var ${modelName} = e.detail;
			this.api
				.create${className}(${modelName})
				.then((response) => {
					if (response.status == 201) {
						window.router.loadUrl('/');
					}
				})
				.catch((error) => {
					if (error.status == 404) {
						alert('user with this email alreadyexists');
					}
					console.log(error);
				});
		}
	}
}

customElements.define('${modelName}-form', ${className}Form);
