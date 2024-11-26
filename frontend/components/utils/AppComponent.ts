import { requestNotificationPermission } from '/js/pwa.ts';
import '@shoelace-style/shoelace/dist/components/icon/icon.js';
import { Router } from '/js/router.ts';
import { routes } from '/js/const/routes.ts';
import i18next from '/i18n.ts';

export class AppComponent extends HTMLElement {
	private shadow;

	constructor() {
		super();
		this.initApp();
		this.shadow = this.attachShadow({ mode: 'open' });
	}

	connectedCallback() {
		this.render();
	}

	render() {
		window.i18next = i18next;
		this.shadow.innerHTML = `
Content loading
		`;
	}

	initApp() {
		requestNotificationPermission();
		// // Define routes
		const router = new Router(routes);
		window.router = router;
		// Register the service-worker
		window.addEventListener('load', () => {
			i18next.on('languageChanged', function(lng) {
				// fire custom event
				localStorage.setItem('preferredLanguage', lng);
				document.dispatchEvent(
					new CustomEvent('language-changed', {
						detail: {'lng': lng},
						bubbles: true, // Allow the event to bubble up to other components
						composed: true, // Allow event to pass through shadow DOM
					})
				);
			});
			const toast = document.getElementById("toast");
			if (toast) {
				window.toast = toast;
			}
			// Initialize router
			if (!navigator.serviceWorker) {
				return;
			}
			navigator.serviceWorker.register('/js/service-worker.js').then(
				(registration) => {
					console.log(
						'Service Worker registration succesful with scope:',
						registration.scope
					);
				},
				(err) => {
					console.log('Service-Worker registration failed: ', err);
				}
			);
		});
	}

	async loadContent(component: HTMLElement, route: Route) {
		await import('/components/navigation/header/Header.ts');
		const content = this.shadow.querySelector('#content');
		if (route.protected) {
			if (content) {
				content.innerHTML = '';
				content.appendChild(component);
			} else {
				const header = document.createElement('header-nav');
				this.shadow.innerHTML = '';
				this.shadow.appendChild(header);
				const content = document.createElement('div');
				content.setAttribute('id', 'content');
				this.shadow.appendChild(content);
				content.appendChild(component);
			}
		} else {
			this.shadow.innerHTML = '';
			this.shadow.appendChild(component);
		}
	}

	async login() {
		await import('/components/login/Login.ts');
		this.shadow.innerHTML = '<login-page></login-page>';
	}
}

customElements.define('app-component', AppComponent);
