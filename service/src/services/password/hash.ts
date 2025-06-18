import PasswordService from './interface';
import bcrypt from 'bcrypt';

export class HashPasswordService implements PasswordService {
	async compare(password: string, hash: string): Promise<boolean> {
		return bcrypt.compare(password, hash);
	}

	async hash(password: string): Promise<string> {
		return bcrypt.hash(password, 10);
	}
}
