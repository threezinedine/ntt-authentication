import express from 'express';
import { log } from '@/middlewares';
import Config from './config';
import ServiceContainer, { MySQLDatabase } from '@/services';
import { DATABASE_SERVICE_NAME } from '@/data/constants';

class App {
	public app: express.Application;
	private config: Config;
	private serviceContainer: ServiceContainer;

	private static instance: App;

	static getInstance() {
		if (!App.instance) {
			App.instance = new App();
		}
		return App.instance;
	}

	private constructor() {
		this.app = express();
		this.config = Config.getInstance();
		this.serviceContainer = ServiceContainer.getInstance();
	}

	async setup() {
		await this.config.load();

		const database = new MySQLDatabase();

		try {
			await database.connect();
		} catch (error) {
			console.error(`Failed to connect to database: ${error}`);
			process.exit(1);
		}

		console.error(this.config.mysql);
		console.log('Connected to database');

		if (this.config.isDevelopment()) {
			console.log('Setting up database...');
			try {
				await database.down();
				await database.up();
			} catch (error) {
				console.error(`Failed to setup database: ${error}`);
				process.exit(1);
			}

			console.log('Database setup completed');
		}

		this.serviceContainer.database = database;
	}

	setupRoutes() {
		this.app.get('/', log, (req, res) => {
			res.send('Hello World');
		});
	}

	listen() {
		this.app.listen(this.config.port, (err) => {
			if (err) {
				console.error(`Failed to start server: ${err}`);
				process.exit(1);
			} else {
				console.log(`Server is running on port ${this.config.port}`);
			}
		});

		process.on('uncaughtException', async (err) => {
			console.error(`Uncaught exception: ${err}`);
			await this.serviceContainer.database.disconnect();
			process.exit(1);
		});

		process.on('unhandledRejection', async (err) => {
			console.error(`Unhandled rejection: ${err}`);
			await this.serviceContainer.database.disconnect();
			process.exit(1);
		});

		process.on('SIGINT', async () => {
			await this.serviceContainer.database.disconnect();
			process.exit(0);
		});
	}
}

export default App;
