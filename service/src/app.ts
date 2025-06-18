import express from 'express';
import { RequestAssertion } from '@/middlewares';
import Config from './config';
import ServiceContainer, {
	JwtTokenizeService,
	MySQLDatabase,
} from '@/services';
import { LoginHandler, RegisterHandler, VerifyHandler } from '@/routes';
import { getLoginUrl, getRegisterUrl, getVerifyUrl } from '@/utils';
import { LoginRequest, RegisterRequest, VerifyRequest } from '@/schemas';
import { HashPasswordService } from './services/password';

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

		this.app.use(express.json());
		this.app.use(express.urlencoded({ extended: true }));
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

		try {
			await database.down();
			await database.up();
		} catch (error) {
			console.error(`Failed to setup database: ${error}`);
			process.exit(1);
		}

		this.serviceContainer.database = database;
		this.serviceContainer.passwordService = new HashPasswordService();
		this.serviceContainer.tokenizeService = new JwtTokenizeService();
	}

	setupRoutes() {
		this.app.post(
			getLoginUrl(),
			[RequestAssertion<LoginRequest>()],
			LoginHandler,
		);

		this.app.post(
			getRegisterUrl(),
			[RequestAssertion<RegisterRequest>()],
			RegisterHandler,
		);

		this.app.post(
			getVerifyUrl(),
			[RequestAssertion<VerifyRequest>()],
			VerifyHandler,
		);
	}

	listen() {
		this.app.listen(this.config.port, (err) => {
			if (err) {
				console.error(`Failed to start server: ${err}`);
				process.exit(1);
			} else {
				console.info(`Server is running on port ${this.config.port}`);
			}
		});
	}

	async teardown() {
		await this.serviceContainer.database.disconnect();
	}
}

export default App;
