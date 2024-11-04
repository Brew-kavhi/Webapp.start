import { Configuration } from '/client_api';
import { ${className}, ${className}Api } from '/client_api/api.ts';
import templateHTML from 'virtual:components/${serviceName}/${className}Detail';
import { TemplatedComponent } from '/components/utils/TemplatedComponent';
import { ${className}_API_HOST } from '/js/const/host';

export class ${className}Details extends TemplatedComponent {
      private configuration: Configuration;
      private api: ${className}Api;
      private attributeSet: boolean = false;
      ${fields.map((field) => `private ${field.name} = '';`).join('\n        ')}

      constructor() {
        super();
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
          if (oldvalue !== newValue) {
              this[name] = newValue;
              this.attributeSet = true;
              this.render();
          }
      }

      setData(data: ${className}) {
		this.${modelName} = data;
		${fields.map((field) => `this.${field.name} = data.${field.name};`).join('\n\t\t')}
		this.render();
      }

      connectedCallback() {
          this.render();
      }

      render() {
          if (!this.${modelName}) {
              if (this.data) {
                    this.${modelName} = this.data;
                    ${fields.map((field) => `this.${field.name} = this.data.${field.name};`).join('\n\t\t')}
              } else {
                  this.get${className}();
              }
          }
          this.shadowRoot.innerHTML = templateHTML(this);
      }

      get${className}() {
          this.api.get${className}(this.params['id']).then((response) =>{
              if (response.status == 200) {
                  const ${modelName}: ${className} = response.data as ${className};
                  this.setData(${modelName});
              }
          }).catch((error)=>{console.log(error);});
      }
}

customElements.define('${modelName}-details', ${className}Details);
