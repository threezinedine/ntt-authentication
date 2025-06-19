import { Request, Response } from 'express';
import { VerifyRequest, VerifyResponse, ErrorResponse } from '@/schemas';
import ServiceContainer from '@/services';
import {
	HTTP_CONFLICT_STATUS,
	HTTP_NOT_FOUND_STATUS,
	HTTP_OK_STATUS,
	HTTP_UNAUTHORIZED_STATUS,
} from '@/data';

export default async function VerifyHandler(
	req: Request<VerifyRequest>,
	res: Response<VerifyResponse | ErrorResponse>,
): Promise<void> {
	const { accessToken } = req.body;
	const serviceContainer = ServiceContainer.getInstance();
	const tokenizeService = serviceContainer.tokenizeService;

	const tokenData = await tokenizeService.verifyAccessToken(accessToken);

	if (!tokenData) {
		res.status(HTTP_UNAUTHORIZED_STATUS).json({
			message: 'Invalid access token',
		});
		return;
	}

	const user = await serviceContainer.database.getUserById(tokenData.id);

	if (!user) {
		res.status(HTTP_NOT_FOUND_STATUS).json({
			message: 'User not found',
		});
		return;
	}

	if (user.role !== tokenData.role) {
		res.status(HTTP_CONFLICT_STATUS).json({
			message: 'User role has been modified',
		});
		return;
	}

	res.status(HTTP_OK_STATUS).json({
		id: user.id,
		username: user.username,
		role: user.role,
	});
}
