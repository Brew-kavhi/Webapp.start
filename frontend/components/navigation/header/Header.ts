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
import { navLinks } from '/js/const/links.js';

class Header extends HTMLElement {
	private links: Link[];

	constructor() {
		super();
		this.attachShadow({ mode: 'open' });
		this.links = navLinks;
	}
	set navigationLinks(links: Link[]) {
		this.links = links;
		this.render();
	}
	connectedCallback() {
		this.render();
	}
	async render() {
		const navItems = this.links
			.map(
				(link) => `
      <a href="${link.href}" data-link>${link.name}</a>
    `
			)
			.join('');
		this.shadowRoot!.innerHTML = `
<link rel="stylesheet" href="components/navigation/header/header.css" />
<nav>${navItems}</nav>
`;
		this.setupNavigation();
	}
	setupNavigation() {
		this.shadowRoot!.querySelectorAll('a[data-link]').forEach((link) => {
			link.addEventListener('click', (event) => {
				event.preventDefault();
				const url = link.getAttribute('href') || '';
				history.pushState(null, null, url);
				this.loadContent(url);
				this.updateActiveLink(url);
			});
		});
		window.addEventListener('popstate', () => {
			this.loadContent(window.location.pathname);
			this.updateActiveLink(window.location.pathname);
		});
		this.loadContent(window.location.pathname);
		this.updateActiveLink(window.location.pathname);
	}
	async loadContent(url: string) {
		const contentElement = document.getElementById('content-body');
		if (!contentElement) {
			return;
		}
		contentElement.innerHTML = '';
		var link = this.links.filter((i: Link) => {
			return i.href === url;
		});
		if (link.length > 0) {
			await import(`../../${link[0].module}/${link[0].component}.js`);
			contentElement.appendChild(document.createElement(link[0].tagName));
		}
	}
	updateActiveLink(url: string) {
		this.shadowRoot?.querySelectorAll('a[data-link]').forEach((link) => {
			link.classList.toggle('active', link.getAttribute('href') === url);
		});
	}
}
customElements.define('header-nav', Header);
