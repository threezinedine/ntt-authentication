import { Role } from '@/data';

export default interface User {
	id: string;
	username: string;
	password: string;
	createdAt: Date;
	updatedAt: Date;
	role: Role;
}
