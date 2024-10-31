class ToastComponent extends HTMLElement {
	private title: string = 'Success';
	private message: string = 'MEssage';
	private icon: string = 'check';

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.render();
	}

	render() {
		this.shadowRoot.innerHTML = `
            <style>
                :host {
                    position: fixed;
                    top: 1em;
                    right: 1em;
                    background: #fff;
                    color: #333;
                    padding: 10px 20px;
                    border-radius: 5px;
                    font-size: 1em;
                    opacity: 0;
                    transition: opacity 0.5s ease;
                        box-shadow: 0px 0px 10px lightgray;
                }
                :host(.success) {
                        border-top: 4px solid #4CAF50;
                }
                :host(.error) {
                        border-top: 4px solid #F44336;
                }
                :host(.warning) {
                        border-top: 4px solid #FF9800;
                }
                :host(.neutral) {
                        border-top: 4px solid gray;
                }
                :host(.show) {
                    opacity: 1;
                }
                sl-icon {
                        font-size: x-large;
                        margin-right: 1rem;
                }
		:host(.success) sl-icon {
			color: #4CAF50;
		}
		:host(.error) sl-icon {
			color: #F44336;
		}
		:host(.warning) sl-icon {
			color: #FF9800;
		}
		:host(.neutral) sl-icon {
			color: gray;
		}
                div {
                        display: grid;
                        line-height:1.5;
                }
                #container {
                        display: flex;
                        align-items: center;
                        min-width: 20vw;
                }
            </style>
                <div id="container">
                        <sl-icon name='${this.icon}'></sl-icon>
                        <div>
                                <strong>${this.title}</strong>
                                ${this.message}
                        </div>
                </div>`;
	}

	success(title: string='Success', message: string = '', duration = 3000) {
		this.title = title;
		this.message = message;
		this.icon = 'check2-circle';
		this.render();
		this.classList = 'show success'; //.add('show');
		setTimeout(() => this.classList.remove('show'), duration);
	}

	error(title: string = 'Error', message: string = '', duration = 3000) {
		this.title = title;
		this.message = message;
		this.icon = 'exclamation-octagon';
		this.render();
		this.classList = 'show error'; //.add('show');
		setTimeout(() => this.classList.remove('show'), duration);
	}

	warning(title: string = 'Warning', message: string = '', duration = 3000) {
		this.title = title;
		this.message = message;
		this.icon = 'exclamation-triangle';
		this.render();
		this.classList = 'show warning';
		setTimeout(() => this.classList.remove('show'), duration);
	}

	info(title: string = 'Information', message: string = '', duration = 3000) {
		this.title = title;
		this.message = message;
		this.icon = 'gear';
		this.render();
		this.classList = 'show neutral';
		setTimeout(() => this.classList.remove('show'), duration);
	}
}

customElements.define('toast-component', ToastComponent);
