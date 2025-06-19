import { Database } from './interface';
import Config from '@/config';
import { User } from '@/models';
import mysql, { ConnectionOptions } from 'mysql2/promise';
import { v4 as uuidv4 } from 'uuid';
import { Role } from '@/data';

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
	}

	async disconnect(): Promise<void> {
		if (this.connection) {
			await this.connection.end();
		} else {
			console.error('No connection to disconnect from');
		}
	}

	async up(): Promise<void> {
		this.connection.query(
			`
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY NOT NULL,
                username VARCHAR(100) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
				role ENUM('admin', 'user', 'super_admin') NOT NULL
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

	async createUser(user: User): Promise<void> {
		await this.connection.execute(
			`
            INSERT INTO users (id, username, password, createdAt, updatedAt, role) VALUES (?, ?, ?, ?, ?, ?);
        `,
			[
				user.id,
				user.username,
				user.password,
				user.createdAt,
				user.updatedAt,
				user.role,
			],
		);
	}

	async getUserByUsername(username: string): Promise<User | null> {
		const [result] = await this.connection.execute(
			`SELECT * FROM users WHERE username = ?`,
			[username],
		);
		return result[0] as User;
	}

	async getUserById(id: string): Promise<User | null> {
		const [result] = await this.connection.execute(
			`SELECT * FROM users WHERE id = ?`,
			[id],
		);
		return result[0] as User;
	}

	async updateUserRole(userId: string, role: Role): Promise<void> {
		await this.connection.execute(
			`UPDATE users SET role = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
			[role, userId],
		);
	}
}

export default MySQLDatabase;
