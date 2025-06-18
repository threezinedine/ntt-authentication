import { Database, MySQLDatabase } from './database';
import { NoHashPasswordService, PasswordService } from './password';

export default class ServiceContainer {
	private static instance: ServiceContainer;

	private constructor() {
		if (ServiceContainer.instance) {
			throw new Error('ServiceContainer is a singleton');
		}
		ServiceContainer.instance = this;
	}

	static getInstance() {
		if (!ServiceContainer.instance) {
			ServiceContainer.instance = new ServiceContainer();
		}
		return ServiceContainer.instance;
	}

	public database: Database;
	public passwordService: PasswordService;
}

export { MySQLDatabase, NoHashPasswordService };
export type { Database, PasswordService };
