import { Request, Response, NextFunction } from 'express';

function log(req: Request, res: Response, next: NextFunction) {
	next();
	console.log(`Request: ${req.method} ${req.url} - ${res.statusCode}`);
}

export default log;
