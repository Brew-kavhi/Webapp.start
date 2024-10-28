import { Configuration } from '/client_api';
import { ${className}, ${className}Api } from '/client_api/api.ts';
import templateHTML from '/components/${serviceName}/${className}Card.html';
import { ${className}_API_HOST } from '/js/const/host.ts';
import { TemplatedComponent } from '/components/utils/TemplatedComponent';

export class ${className}Card extends TemplatedComponent {
      private configuration: Configuration;
      private api: ${className}Api;
      private attributeSet: boolean = false;

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
}

customElements.define('${modelName}-card', ${className}Card);
