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
import { routes } from '/js/const/routes.js';
import { TemplatedComponent } from '/components/utils/TemplatedComponent';

class Header extends TemplatedComponent {
	private routes: Route[];
	private navItems;

	constructor() {
		super();
		this.routes = routes;
		this.navItems = this.routes
			.map((link) => {
				if (!link.hide) {
					return `
      <a href="${link.path}" data-link>${link.name}</a>
    `;
				}
				return '';
			})
			.join('');
		Header.templateFile = '/components/navigation/header/header.html';
	}
	set navigationLinks(routes: Route[]) {
		this.routes = routes;
		this.render();
	}

	connectedCallback() {
		this.loadTemplate(Header).then(() => this.render());
	}

	render() {
		this.shadowRoot.innerHTML = this.prepareHTML(Header);
		this.setupNavigation();
		this.addIcons();
	}
	setupNavigation() {
		this.shadowRoot?.addEventListener('click', this);
		this.updateActiveLink(window.location.pathname);
	}

	updateActiveLink(url: string) {
		this.shadowRoot?.querySelectorAll('a[data-link]').forEach((link) => {
			link.classList.toggle('active', link.getAttribute('href') === url);
		});
	}

	handleEvent(e) {
		e.preventDefault();
		if (e.target.tagName == 'A') {
			const url = e.target.getAttribute('href') || '';
			window.router.loadRoute(url.split('/').slice(1).join('/'));
			this.updateActiveLink(url);
		} else if (e.target.tagName == 'SL-ICON') {
			const url = e.target.parentElement.getAttribute('href') || '';
			window.router.loadRoute(url.split('/').slice(1).join('/'));
			this.updateActiveLink(url);
		}
	}
}
customElements.define('header-nav', Header);
