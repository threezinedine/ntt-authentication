import express from 'express';
import { RequestAssertion } from '@/middlewares';
import Config from './config';
import ServiceContainer, {
	JwtTokenizeService,
	MySQLDatabase,
} from '@/services';
import {
	LoginHandler,
	MoveToAdminHandler,
	RefreshHandler,
	RegisterHandler,
	VerifyHandler,
} from '@/routes';
import {
	getLoginUrl,
	getMoveToAdminUrl,
	getRefreshUrl,
	getRegisterUrl,
	getVerifyUrl,
} from '@/utils';
import {
	LoginRequest,
	MoveToAdminRequest,
	RefreshRequest,
	RegisterRequest,
	VerifyRequest,
} from '@/schemas';
import { HashPasswordService } from './services/password';
import { v4 as uuidv4 } from 'uuid';
import { User } from '@/models';
import { Role } from './data';

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

		await this.setupSuperAdmin();
	}

	private async setupSuperAdmin() {
		const database = this.serviceContainer.database;
		const passwordService = this.serviceContainer.passwordService;

		const superAdmin: User = {
			id: uuidv4(),
			username: this.config.superAdmin.username,
			password: await passwordService.hash(
				this.config.superAdmin.password,
			),
			createdAt: new Date(),
			updatedAt: new Date(),
			role: Role.SUPER_ADMIN,
		};

		try {
			await database.createUser(superAdmin);
		} catch (error) {
			console.error(`Failed to setup super admin: ${error}`);
		}
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

		this.app.post(
			getRefreshUrl(),
			[RequestAssertion<RefreshRequest>()],
			RefreshHandler,
		);

		this.app.put(
			getMoveToAdminUrl(),
			[RequestAssertion<MoveToAdminRequest>()],
			MoveToAdminHandler,
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
