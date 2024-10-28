import { Configuration } from '/client_api';
import { ${className}, ${className}Api } from '/client_api/api.ts';
import templateHTML from '/components/${serviceName}/${className}List.html';
import { ${className}_API_HOST } from '/js/const/host';
import { TemplatedComponent } from '/components/utils/TemplatedComponent';

export class ${className}List extends TemplatedComponent {
      private configuration: Configuration;
      private api: ${className}Api;

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

      connectedCallback() {
          this.getAll${className}();
          this.render();
      }

      render() {
          
          this.shadowRoot.innerHTML = this.dynamicHTML(templateHTML);
      }

      getAll${className}() {
          this.api.list${className}().then((response) =>{
              if (response.status == 200) {
                  const container = this.shadowRoot.querySelector('#content');
                  for (const ${modelName}Data: ${className} in response.data) {
                      const ${modelName}Card = document.createElement('${modelName}-list');
                      // for every field of $modelName set Attribute
                      ${fields.map((field) => `${modelName}Card.setAttribute('${field.name}', ${modelName}Data['${field.name}']);`).join('\n')}
                      container.appendChild(${modelName}Card);
                  }
              }
          }).catch((error)=>{console.log(error);});
      }
}

customElements.define('${modelName}-list', ${className}List);
