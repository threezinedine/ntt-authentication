import { Role } from '@/data';

export interface User {
	id: string;
	username: string;
	password: string;
	createdAt: Date;
	updatedAt: Date;
	role: Role;
}
