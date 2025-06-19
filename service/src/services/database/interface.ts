import { User } from '@/models';

export interface Database {
	connect(): Promise<void>;
	disconnect(): Promise<void>;

	up(): Promise<void>;
	down(): Promise<void>;

	createUser(user: User): Promise<void>;
	getUserByUsername(username: string): Promise<User | null>;
	getUserById(id: string): Promise<User | null>;
}
