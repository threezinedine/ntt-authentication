import PasswordService from './interface';

export default class NoHashPasswordService implements PasswordService {
	hash(password: string): Promise<string> {
		return Promise.resolve(password);
	}

	compare(password: string, hash: string): Promise<boolean> {
		return Promise.resolve(password === hash);
	}
}
