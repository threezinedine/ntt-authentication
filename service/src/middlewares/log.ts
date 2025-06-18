import { Request, Response, NextFunction } from 'express';

function Log(req: Request, res: Response, next: NextFunction) {
	next();
	console.info(`Request: ${req.method} ${req.url} - ${res.statusCode}`);
}

export default Log;
