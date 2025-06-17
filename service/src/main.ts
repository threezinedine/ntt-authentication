import App from './app';

(async () => {
	const app = App.getInstance();
	await app.setup();
	app.setupRoutes();
	app.listen();
})();
