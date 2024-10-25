export const routes: Route[] = [
	{
		name: 'Home',
		path: '/',
		component: 'CoffeeCard',
		module: 'coffee',
		tagName: 'coffee-card',
		protected: true,
	},
	{
		name: 'About',
		path: '/about',
		component: 'CoffeeDetails',
		module: 'coffee',
		tagName: 'coffee-details',
		protected: true,
	},
	{
		name: 'Delete',
		path: '/deleteprofile',
		component: 'DeleteUser',
		module: 'registration',
		tagName: 'delete-user',
		protected: true,
	},
	{
		name: 'settings',
		path: '/settings',
		component: 'Settings',
		module: 'settings',
		tagName: 'settings-page',
		protected: true,
		hide: true,
	},
	{
		name: 'registration',
		path: '/register',
		component: 'Register',
		module: 'registration',
		tagName: 'register-page',
		hide: true,
	},
	{
		name: 'login',
		path: '/login',
		component: 'Login',
		module: 'login',
		tagName: 'login-page',
		hide: true,
	},
	{
		name: 'logout',
		path: '/logout',
		component: 'Logout',
		module: 'login',
		tagName: 'logout-page',
		hide: true,
		protected: true,
	},
]; // Default links if none are provided.

export const examplecoffee = {
	name: 'Testkaffee',
};
