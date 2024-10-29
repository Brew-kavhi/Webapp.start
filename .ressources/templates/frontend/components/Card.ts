import { Configuration } from '/client_api';
import { ${className}, ${className}Api } from '/client_api/api.ts';
import templateHTML from '/components/${serviceName}/${className}Card.html';
import { ${className}_API_HOST } from '/js/const/host.ts';
import { TemplatedComponent } from '/components/utils/TemplatedComponent';

export class ${className}Card extends TemplatedComponent {
      private configuration: Configuration;
      private api: ${className}Api;
      private attributeSet: boolean = false;
      private ${modelName}: ${className};

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
      		if (oldValue != newValue) {
		        this[name] = newValue;
		        this.attributeSet = true;
        		this.render();
		}
      }

      set${className}(${modelName}: ${className}) {
		this.${modelName} = ${modelName};
		${fields.map((field) => `this.${field.name} = ${modelName}.${field.name};`).join('\n\t\t')}
		this.render();
	}

      connectedCallback() {
        this.render();
      }

      render() {
        this.shadowRoot.innerHTML = this.dynamicHTML(templateHTML);
	this.shadowRoot.addEventListener('click', this);
      }

      handleEvent(e) {
		console.log(e);
		if (e.type ==='click' && e.target.tagName ==='H3') {
			e.preventDefault();
			window.router.loadUrl(`/coffee/${'${this.id}'}`, this.${modelName});
		}
	}
}

customElements.define('${modelName}-card', ${className}Card);
