import { Database } from './interface';
import Config from '@/config';
import mysql, { ConnectionOptions } from 'mysql2/promise';

class MySQLDatabase implements Database {
	private config: Config;
	private connection: mysql.Connection;

	constructor() {
		this.config = Config.getInstance();
		this.connection = null;
	}

	async connect(): Promise<void> {
		const access: ConnectionOptions = {
			host: this.config.mysql.host,
			port: this.config.mysql.port,
			user: this.config.mysql.user,
			password: this.config.mysql.password,
			database: this.config.mysql.database,
		};

		this.connection = await mysql.createConnection(access);
		console.log('Connected to database');
	}

	async disconnect(): Promise<void> {
		if (this.connection) {
			await this.connection.end();
			console.log('Disconnected from database');
		} else {
			console.error('No connection to disconnect from');
		}
	}

	async up(): Promise<void> {
		this.connection.query(
			`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY NOT NULL,
                username VARCHAR(100) NOT NULL,
                password VARCHAR(255) NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
            );
            `,
		);
	}

	async down(): Promise<void> {
		this.connection.query(
			`
            DROP TABLE IF EXISTS users;
            `,
		);
	}
}

export default MySQLDatabase;
