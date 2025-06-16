import express from 'express';
import { add } from '@/utils';

class App {
	private app: express.Application;

	constructor() {
		this.app = express();
	}

	async setup() {}

	setupRoutes() {
		this.app.get('/', (req, res) => {
			res.send('Hello World');
		});

		this.app.get('/test', (req, res) => {
			res.send(add(1, 2));
		});
	}

	listen() {
		this.app.listen(3000, () =>
			console.log('Server is running on port 3000'),
		);
	}
}

const app = new App();

export default app;
