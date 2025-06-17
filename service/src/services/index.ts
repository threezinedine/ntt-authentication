import { Database, MySQLDatabase } from './database';

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
}

export { MySQLDatabase };
export type { Database };
