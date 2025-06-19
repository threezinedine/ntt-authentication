import { Database, MySQLDatabase } from './database';
import { NoHashPasswordService, PasswordService } from './password';
import { JwtTokenizeService, TokenizeService } from './tokenize';

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
	public tokenizeService: TokenizeService;
}

export { MySQLDatabase, NoHashPasswordService, JwtTokenizeService };
export type { Database, PasswordService, TokenizeService };
