import { Request, Response } from 'express';
import { VerifyRequest, VerifyResponse, ErrorResponse } from '@/schemas';
import ServiceContainer from '@/services';
import { HTTP_OK_STATUS, HTTP_UNAUTHORIZED_STATUS } from '@/data';

export default async function VerifyHandler(
	req: Request<VerifyRequest>,
	res: Response<VerifyResponse | ErrorResponse>,
): Promise<void> {
	const { accessToken } = req.body;
	const serviceContainer = ServiceContainer.getInstance();
	const tokenizeService = serviceContainer.tokenizeService;

	const tokenData = await tokenizeService.verifyAccessToken(accessToken);

	if (tokenData === null) {
		res.status(HTTP_UNAUTHORIZED_STATUS).json({
			message: 'Invalid access token',
		});
		return;
	}

	res.status(HTTP_OK_STATUS).json({});
}
