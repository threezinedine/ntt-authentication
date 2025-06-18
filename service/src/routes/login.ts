import { Request, Response } from 'express';
import { LoginRequest, LoginResponse, ErrorResponse } from '@/schemas';
import {
	HTTP_BAD_REQUEST_STATUS,
	HTTP_NOT_FOUND_STATUS,
	HTTP_OK_STATUS,
	HTTP_UNAUTHORIZED_STATUS,
} from '@/data';
import ServiceContainer from '@/services';

export default async function LoginHandler(
	req: Request<LoginRequest>,
	res: Response<LoginResponse | ErrorResponse>,
): Promise<void> {
	const { username, password } = req.body;
	const serviceContainer = ServiceContainer.getInstance();

	if (!username || !password) {
		res.status(HTTP_BAD_REQUEST_STATUS).json({
			message: 'Username and password are required',
		});
		return;
	}

	const user = await serviceContainer.database.getUserByUsername(username);

	if (!user) {
		res.status(HTTP_NOT_FOUND_STATUS).json({
			message: 'User not found',
		});
		return;
	}

	const isPasswordValid = await serviceContainer.passwordService.compare(
		password,
		user.password,
	);

	if (!isPasswordValid) {
		res.status(HTTP_UNAUTHORIZED_STATUS).json({
			message: 'Invalid password',
		});
		return;
	}

	res.status(HTTP_OK_STATUS).json({
		accessToken: '123',
		refreshToken: '123',
	});
}
