import { HTTP_BAD_REQUEST_STATUS } from '@/data';
import { Request, Response, NextFunction } from 'express';

export default function RequestAssertion<T>() {
	return (req: Request, res: Response, next: NextFunction) => {
		const body = req.body as T;

		if (!body) {
			res.status(HTTP_BAD_REQUEST_STATUS).json({
				message: 'Request body is required',
			});
			return;
		}

		next();
	};
}
