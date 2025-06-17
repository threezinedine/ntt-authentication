import { describe, it, expect, beforeAll } from '@jest/globals';
import supertest from 'supertest';
import App from '@/app';
import { HTTP_BAD_REQUEST_STATUS } from '@/data';
import { getLoginUrl } from '@/utils';

describe('Authentication testing', () => {
	beforeAll(async () => {
		await App.getInstance().setup();
	});

	const app = App.getInstance();

	it('should return error when the username is not provided', async () => {
		const request = supertest(app.app);

		const response = await request.post(getLoginUrl()).send({
			password: '123456',
		});

		expect(response.status).toBe(HTTP_BAD_REQUEST_STATUS);
	});
});
