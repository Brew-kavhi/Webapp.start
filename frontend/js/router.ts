import { USER_API_HOST } from '/js/const/host.ts';

export class Router {
	private routes: Route[];

	constructor(routes: Route[], isAuthenticated: () => boolean) {
		this.routes = routes;
		this._loadInitialRoute();
		window.addEventListener('popstate', () => this._loadRoute());
	}

	loadRoute(...urlSegments) {
		let matchedRoute: Route = this._matchRoute(urlSegments);

		if (!matchedRoute) {
			console.log('Route not found');
			matchedRoute = {
				name: 'Not found',
				path: 'notfound',
				module: 'utils',
				component: 'NotFound',
				tagName: 'not-found',
			};
		}
		if (matchedRoute.protected) {
			fetch(`${USER_API_HOST}/auth/verify`, {
				method: 'GET',
				credentials: 'include', // Ensure cookies are sent with the request
			})
				.then((response) => {
					if (response.ok) {
						if (urlSegments.length == 1 && urlSegments[0] == 'login') {
							matchedRoute = this._matchRoute(['']);
							console.log(matchedRoute);
							urlSegments = [];
						}
						this._loadContent(matchedRoute, urlSegments);
					} else {
						this._redirectToLogin();
					}
				})
				.catch((error) => {
					this._redirectToLogin();
				});
		} else {
			this._loadContent(matchedRoute, urlSegments);
		}
	}

	_matchRoute(urlSegments) {
		// Try to find a matching route based on URL segments
		return this.routes.find((route) => {
			const routePathSegments = route.path.split('/').slice(1);

			// Check if the route has the same number of segments
			if (routePathSegments.length !== urlSegments.length) return false;

			// Check each segment to see if it matches, allowing for dynamic segments (e.g., ':id')
			return routePathSegments.every((segment, i) => {
				return segment.startsWith(':') || segment === urlSegments[i];
			});
		});
	}

	_getParams(matchedRoute, urlSegments) {
		const params = {};
		const routePathSegments = matchedRoute.path.split('/').slice(1);

		// Collect parameters from the route (e.g., ':id')
		routePathSegments.forEach((segment, i) => {
			if (segment.startsWith(':')) {
				const paramName = segment.slice(1);
				params[paramName] = urlSegments[i];
			}
		});

		return Object.keys(params).length ? params : null;
	}

	_loadInitialRoute() {
		const pathSegments = window.location.pathname.split('/').slice(1);
		this.loadRoute(...pathSegments);
	}

	_loadRoute() {
		const pathSegments = window.location.pathname.split('/').slice(1);
		this.loadRoute(...pathSegments);
	}
	_redirectToLogin() {
		console.log('login');
		window.history.pushState({}, '', '/login');
		document.getElementsByTagName('app-component')[0].login();
	}

	_loadContent(matchedRoute: Route, urlSegments) {
		// Extract parameters (if any) from the matched route
		const params = this._getParams(matchedRoute, urlSegments);

		// Update the browser's URL
		window.history.pushState({}, '', `/${urlSegments.join('/')}`);

		// Create the component and pass the params if needed
		import(
			`/components/${matchedRoute.module}/${matchedRoute.component}.ts`
		).then((componentModule) => {
			const component = document.createElement(matchedRoute.tagName);
			if (params) component.params = params;

			document
				.getElementsByTagName('app-component')[0]
				.loadContent(component, matchedRoute);
		});
	}
}
