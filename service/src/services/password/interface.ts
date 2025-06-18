export default interface PasswordService {
	hash(password: string): Promise<string>;
	compare(password: string, hash: string): Promise<boolean>;
}
