import { Request, Response } from 'express';
import { RefreshRequest, RefreshResponse, ErrorResponse } from '@/schemas';
import {
	HTTP_BAD_REQUEST_STATUS,
	HTTP_OK_STATUS,
	HTTP_UNAUTHORIZED_STATUS,
} from '@/data';
import ServiceContainer from '@/services';

export default async function RefreshHandler(
	req: Request<RefreshRequest>,
	res: Response<RefreshResponse | ErrorResponse>,
): Promise<void> {
	const { accessToken, refreshToken } = req.body;

	if (!accessToken || !refreshToken) {
		res.status(HTTP_BAD_REQUEST_STATUS).json({
			message: 'Access token and refresh token are required',
		});
		return;
	}

	const serviceContainer = ServiceContainer.getInstance();
	const tokenizeService = serviceContainer.tokenizeService;

	try {
		const newAccessToken = await tokenizeService.refreshAccessToken(
			accessToken,
			refreshToken,
		);
		res.status(HTTP_OK_STATUS).json({ accessToken: newAccessToken });
		return;
	} catch (error) {
		res.status(HTTP_UNAUTHORIZED_STATUS).json({
			message: 'Invalid access token or refresh token',
		});
		return;
	}
}
