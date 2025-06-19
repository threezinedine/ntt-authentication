import { Request, Response } from 'express';
import { RegisterRequest, RegisterResponse, ErrorResponse } from '@/schemas';
import {
	HTTP_BAD_REQUEST_STATUS,
	HTTP_CREATED_STATUS,
	HTTP_INTERNAL_SERVER_ERROR_STATUS,
	Role,
} from '@/data';
import { User } from '@/models';
import { v4 as uuidv4 } from 'uuid';
import ServiceContainer from '@/services';

export default async function RegisterHandler(
	req: Request<RegisterRequest>,
	res: Response<RegisterResponse | ErrorResponse>,
) {
	const { username, password } = req.body;

	if (!username || !password) {
		res.status(HTTP_BAD_REQUEST_STATUS).json({
			message: 'Username and password are required',
		});
		return;
	}

	const serviceContainer = ServiceContainer.getInstance();

	const user: User = {
		id: uuidv4(),
		username,
		password: await serviceContainer.passwordService.hash(password),
		createdAt: new Date(),
		updatedAt: new Date(),
		role: Role.USER,
	};

	try {
		await serviceContainer.database.createUser(user);
	} catch (error) {
		console.error(`Failed to register user: ${error}`);

		res.status(HTTP_INTERNAL_SERVER_ERROR_STATUS).json({
			message: 'Failed to register user',
		});
		return;
	}

	res.status(HTTP_CREATED_STATUS).json({});
}
