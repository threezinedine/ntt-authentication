import dotenv from 'dotenv';

class Config {
	public host: string;
	public port: number;

	public mode: 'development' | 'production';

	public mysql: {
		host: string;
		port: number;
		user: string;
		password: string;
		database: string;
	};

	private static instance: Config;

	private constructor() {
		if (Config.instance) {
			throw new Error('Config class is a singleton');
		}
		Config.instance = this;
	}

	static getInstance() {
		if (!Config.instance) {
			Config.instance = new Config();
		}
		return Config.instance;
	}

	async load() {
		dotenv.config({ path: '.env' });

		this.host = process.env.HOST || 'localhost';
		this.port = Number(process.env.PORT) || 8080;

		this.mysql = {
			host: process.env.MYSQL_HOST || 'localhost',
			port: Number(process.env.MYSQL_PORT) || 3306,
			user: process.env.MYSQL_USER || 'root',
			password: process.env.MYSQL_PASSWORD || 'password',
			database: process.env.MYSQL_DATABASE || 'database',
		};

		this.mode = (process.env.MODE || 'development') as
			| 'development'
			| 'production';
	}

	isDevelopment(): boolean {
		return this.mode === 'development';
	}

	isProduction(): boolean {
		return this.mode === 'production';
	}
}

export default Config;
