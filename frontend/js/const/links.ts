export const navLinks: Link[] = [
	{
		name: 'Home',
		href: '/',
		component: '/components/coffee/CoffeeCard.js',
		tagName: 'coffee-card',
	},
	{
		name: 'About',
		href: '/about',
		component: '/components/coffee/CoffeeDetails.js',
		tagName: 'coffee-details',
	},
]; // Default links if none are provided.

export const examplecoffee = {
	name: 'Testkaffee',
};
