import app from './app';

(async () => {
	await app.setup();
	app.setupRoutes();
	app.listen();
})();
