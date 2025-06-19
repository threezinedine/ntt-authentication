import {
	AUTHORIZATION_HEADER,
	HTTP_FORBIDDEN_STATUS,
	HTTP_NOT_FOUND_STATUS,
	HTTP_UNAUTHORIZED_STATUS,
	Role,
} from '@/data';
import ServiceContainer from '@/services';
import { getTokenFromHeader } from '@/utils';
import { NextFunction, Request, Response } from 'express';

export interface AuthenUser {
	id: string;
	username: string;
	role: Role;
	isAuthenticated: boolean;
}

export interface AuthenRequest<T> extends Request<T> {
	authenUser?: AuthenUser;
}

export default function AuthenMiddleware(
	force: boolean = true,
	roles: Role[] | null = null,
) {
	if (!force && roles && roles.length !== 0) {
		throw new Error('Roles are not allowed when force is false');
	}

	return async (
		req: AuthenRequest<any>,
		res: Response,
		next: NextFunction,
	) => {
		const tokenizeService = ServiceContainer.getInstance().tokenizeService;
		const databaseService = ServiceContainer.getInstance().database;

		const accessToken = getTokenFromHeader(
			req.headers[AUTHORIZATION_HEADER.toLowerCase()] as string,
		);

		if (!accessToken) {
			res.status(HTTP_UNAUTHORIZED_STATUS).json({
				message: 'The access token is required',
			});
			return;
		}

		const tokenData = await tokenizeService.verifyAccessToken(accessToken);

		if (!tokenData) {
			res.status(HTTP_UNAUTHORIZED_STATUS).json({
				message: 'The access token is invalid',
			});
			return;
		}

		const user = await databaseService.getUserById(tokenData.id);

		if (!user) {
			res.status(HTTP_NOT_FOUND_STATUS).json({
				message: 'User not found',
			});
			return;
		}

		req.authenUser = {
			id: user.id,
			username: user.username,
			role: user.role,
			isAuthenticated: true,
		};

		if (roles && !roles.includes(user.role)) {
			res.status(HTTP_FORBIDDEN_STATUS).json({
				message: 'Forbidden',
			});
			return;
		}

		next();
	};
}
