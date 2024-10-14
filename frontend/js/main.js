// Register the service-worker
window.addEventListener('load', () => {
	navigator.serviceWorker.register('/service-worker.js').then(
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
