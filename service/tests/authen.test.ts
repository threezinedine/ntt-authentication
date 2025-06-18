import { describe, it, expect, beforeAll } from '@jest/globals';
import supertest from 'supertest';
import App from '@/app';
import {
	HTTP_BAD_REQUEST_STATUS,
	HTTP_CREATED_STATUS,
	HTTP_OK_STATUS,
	HTTP_UNAUTHORIZED_STATUS,
} from '@/data';
import { getLoginUrl, getRegisterUrl, randomString } from '@/utils';

describe('Authentication testing', () => {
	beforeAll(async () => {
		await App.getInstance().setup();
		App.getInstance().setupRoutes();
	});

	afterAll(async () => {
		await App.getInstance().teardown();
	});

	const app = App.getInstance();
	const request = supertest(app.app);

	it('should return error when the username is not provided', async () => {
		const response = await request.post(getLoginUrl()).send({
			password: '123456',
		});

		expect(response.status).toBe(HTTP_BAD_REQUEST_STATUS);
	});

	it('should return error when the password is not provided', async () => {
		const response = await request.post(getLoginUrl()).send({
			username: 'test',
		});

		expect(response.status).toBe(HTTP_BAD_REQUEST_STATUS);
	});

	it('should return access token when the username and password are provided', async () => {
		const testUsername = randomString(10);
		const testPassword = randomString(10);

		await createTestUser(testUsername, testPassword);

		const response = await request.post(getLoginUrl()).send({
			username: testUsername,
			password: testPassword,
		});

		expect(response.status).toBe(HTTP_OK_STATUS);
		expect(response.body.accessToken).toBeDefined();
		expect(response.body.refreshToken).toBeDefined();
	});

	it('should return error when the username is already taken in register api', async () => {
		const response = await request.post(getRegisterUrl()).send({
			password: '123456',
		});

		expect(response.status).toBe(HTTP_BAD_REQUEST_STATUS);
	});

	it('should return error when the password is not provided in register api', async () => {
		const response = await request.post(getRegisterUrl()).send({
			username: 'test',
		});

		expect(response.status).toBe(HTTP_BAD_REQUEST_STATUS);
	});

	async function createTestUser(username: string, password: string) {
		await request.post(getRegisterUrl()).send({
			username,
			password,
		});
	}

	it('should create a new user when the request is valid in register api', async () => {
		const testUsername = randomString(10);
		const testPassword = randomString(10);

		const response = await request.post(getRegisterUrl()).send({
			username: testUsername,
			password: testPassword,
		});

		expect(response.status).toBe(HTTP_CREATED_STATUS);

		const loginResponse = await request.post(getLoginUrl()).send({
			username: testUsername,
			password: testPassword,
		});

		expect(loginResponse.status).toBe(HTTP_OK_STATUS);
		expect(loginResponse.body.accessToken).toBeDefined();
		expect(loginResponse.body.refreshToken).toBeDefined();
	});

	it('should cannot login with wrong password', async () => {
		const testUsername = randomString(10);
		const testPassword = randomString(10);

		await createTestUser(testUsername, testPassword);

		const loginResponse = await request.post(getLoginUrl()).send({
			username: testUsername,
			password: 'wrong_password',
		});

		expect(loginResponse.status).toBe(HTTP_UNAUTHORIZED_STATUS);
	});
});
