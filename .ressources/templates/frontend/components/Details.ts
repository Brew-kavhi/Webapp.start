import { Configuration } from '/client_api';
import { ${className}, ${className}Api } from '/client_api/api.ts';
import templateHTML from '/components/${serviceName}/${className}Detail.html';
import { TemplatedComponent } from '/components/utils/TemplatedComponent';
import { ${className}_API_HOST } from '/js/const/host';

export class ${className}Details extends TemplatedComponent {
      private configuration: Configuration;
      private api: ${className}Api;
      private attributeSet: boolean = false;

      constructor() {
        super();
        ${fields.map((field) => `this.${field.name} = '';`).join('\n        ')}
		this.configuration = new Configuration({
			basePath: ${className}_API_HOST,
			baseOptions: {
				withCredentials: true,
			},
		});
		this.api = new ${className}Api(this.configuration);
      }

      static get observedAttributes() {
          return [${fields.map((field) => `'${field.name}'`).join(', ')}];
      }

      attributeChangedCallback(name, oldValue, newValue) {
          this[name] = newValue;
          this.attributeSet = true;
          this.render();
      }

      connectedCallback() {
          this.render();
      }

      render() {
          this.shadowRoot.innerHTML = this.dynamicHTML(templateHTML);
      }

      get${className}() {
          this.api.get${className}().then((response) =>{
              if (response.status == 200) {
                  const ${modelName}: ${className} = response.data as ${className};
                  for(const key in response.data) {
                      this[key] = ${modelName}[key];
                  }
              }
          }).catch((error)=>{console.log(error);});
      }
}

customElements.define('${modelName}-details', ${className}Details);
