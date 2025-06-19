import { Role } from '@/data';

export interface TokenData {
	id: string;
	username: string;
	role: Role;
}

export default interface TokenizeService {
	generateAccessToken(data: TokenData): Promise<string>;
	generateRefreshToken(data: TokenData): Promise<string>;
	verifyAccessToken(accessToken: string): Promise<TokenData | null>;
	verifyRefreshToken(refreshToken: string): Promise<TokenData | null>;
	refreshAccessToken(
		accessToken: string,
		refreshToken: string,
	): Promise<string>;
}
