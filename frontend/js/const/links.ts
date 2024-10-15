export const navLinks: Link[] = [
	{
		name: 'Home',
		href: '/',
		component: 'CoffeeCard',
		module: 'coffee',
		tagName: 'coffee-card',
	},
	{
		name: 'About',
		href: '/about',
		component: 'CoffeeDetails',
		module: "coffee",
		tagName: 'coffee-details',
	},
]; // Default links if none are provided.

export const examplecoffee = {
	name: 'Testkaffee',
};
