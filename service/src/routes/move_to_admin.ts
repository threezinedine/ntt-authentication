import { Request, Response } from 'express';
import {
	MoveToAdminRequest,
	MoveToAdminResponse,
	ErrorResponse,
} from '@/schemas';
import ServiceContainer from '@/services';
import {
	HTTP_CONFLICT_STATUS,
	HTTP_INTERNAL_SERVER_ERROR_STATUS,
	HTTP_NOT_FOUND_STATUS,
	HTTP_OK_STATUS,
	Role,
} from '@/data';

export default async function moveToAdmin(
	request: Request<{}, MoveToAdminResponse, MoveToAdminRequest>,
	response: Response<MoveToAdminResponse | ErrorResponse>,
): Promise<void> {
	const { userId } = request.body;
	const databaseService = ServiceContainer.getInstance().database;

	const user = await databaseService.getUserById(userId);

	if (!user) {
		console.error(`User with id ${userId} not found`);
		response.status(HTTP_NOT_FOUND_STATUS).json({
			message: `User with id ${userId} not found`,
		});
		return;
	}

	if (user.role === Role.ADMIN) {
		console.error(`User with id ${userId} is already an admin`);
		response.status(HTTP_CONFLICT_STATUS).json({
			message: `User with id ${userId} is already an admin`,
		});
		return;
	}

	try {
		await databaseService.updateUserRole(userId, Role.ADMIN);
	} catch (error) {
		console.error(`Failed to update user role: ${error}`);
		response.status(HTTP_INTERNAL_SERVER_ERROR_STATUS).json({
			message: `Failed to update user role: ${error}`,
		});
		return;
	}

	response.status(HTTP_OK_STATUS).json({});
}
