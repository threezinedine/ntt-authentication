import Config from '@/config';
import { TokenData } from './interface';
import TokenizeService from './interface';
import jwt from 'jsonwebtoken';

export default class JwtTokenizeService implements TokenizeService {
	private config: Config;

	constructor() {
		this.config = Config.getInstance();
	}

	private generateToken(data: TokenData, expiresIn: number, secret: string) {
		const payload = {
			id: data.id,
			username: data.username,
			role: data.role,
			exp: Math.floor(Date.now() / 1000) + expiresIn * 60,
		};

		return jwt.sign(payload, secret);
	}

	generateRefreshToken(data: TokenData): Promise<string> {
		return Promise.resolve(
			this.generateToken(
				data,
				this.config.jwt.refreshTokenExpiresIn,
				this.config.jwt.refreshTokenSecret,
			),
		);
	}

	async verifyAccessToken(accessToken: string): Promise<TokenData | null> {
		try {
			const decoded = jwt.verify(
				accessToken,
				this.config.jwt.accessTokenSecret,
			);

			return decoded as TokenData;
		} catch (error) {
			return null;
		}
	}

	async verifyRefreshToken(refreshToken: string): Promise<TokenData | null> {
		try {
			const decoded = jwt.verify(
				refreshToken,
				this.config.jwt.refreshTokenSecret,
			);

			return decoded as TokenData;
		} catch (error) {
			return null;
		}
	}

	async refreshAccessToken(
		accessToken: string,
		refreshToken: string,
	): Promise<string> {
		// const accessTokenData = this.verifyAccessToken(accessToken);
		const refreshTokenData = await this.verifyRefreshToken(refreshToken);

		if (!refreshTokenData) {
			throw new Error('Invalid access token or refresh token');
		}

		return this.generateAccessToken(refreshTokenData);
	}

	generateAccessToken(data: TokenData): Promise<string> {
		return Promise.resolve(
			this.generateToken(
				data,
				this.config.jwt.accessTokenExpiresIn,
				this.config.jwt.accessTokenSecret,
			),
		);
	}
}
