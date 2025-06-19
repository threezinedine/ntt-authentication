import { describe, it, expect, beforeAll } from '@jest/globals';
import supertest from 'supertest';
import App from '@/app';
import {
	HTTP_BAD_REQUEST_STATUS,
	HTTP_CREATED_STATUS,
	HTTP_NOT_FOUND_STATUS,
	HTTP_OK_STATUS,
	HTTP_UNAUTHORIZED_STATUS,
	Role,
} from '@/data';
import {
	getLoginUrl,
	getRefreshUrl,
	getRegisterUrl,
	getVerifyUrl,
	randomString,
} from '@/utils';
import { VerifyResponse } from '@/schemas';
import ServiceContainer from '@/services';
import { JwtTokenizeService, TokenData } from '@/services/tokenize';
import Config from '@/config';

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

	async function login(
		username: string,
		password: string,
	): Promise<{ accessToken: string; refreshToken: string }> {
		const response = await request.post(getLoginUrl()).send({
			username,
			password,
		});

		return {
			accessToken: response.body.accessToken,
			refreshToken: response.body.refreshToken,
		};
	}

	async function verify(accessToken: string): Promise<TokenData> {
		const response = await request.post(getVerifyUrl()).send({
			accessToken,
		});

		expect(response.status).toBe(HTTP_OK_STATUS);
		expect(response.body.id).toBeDefined();
		expect(response.body.username).toBeDefined();
		expect(response.body.role).toBeDefined();

		return response.body;
	}

	async function verifyError(accessToken: string): Promise<void> {
		const response = await request.post(getVerifyUrl()).send({
			accessToken,
		});

		expect(response.status).toBe(HTTP_UNAUTHORIZED_STATUS);
		expect(response.body.message).toBeDefined();
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

	it('should return error when the user is not found', async () => {
		const response = await request.post(getLoginUrl()).send({
			username: 'not_found',
			password: '123456',
		});

		expect(response.status).toBe(HTTP_NOT_FOUND_STATUS);
	});

	it('should login and the access token is verified', async () => {
		const testUsername = randomString(10);
		const testPassword = randomString(10);

		await createTestUser(testUsername, testPassword);
		const { accessToken } = await login(testUsername, testPassword);

		const response = await request.post(getVerifyUrl()).send({
			accessToken,
		});

		expect(response.status).toBe(HTTP_OK_STATUS);
		const user = response.body as VerifyResponse;
		expect(user.id).toBeDefined();
		expect(user.username).toBe(testUsername);
		expect(user.role).toBe('user');
	});

	it('should not able to verify the access token when the access token is invalid', async () => {
		const testUsername = randomString(10);
		const testPassword = randomString(10);

		await createTestUser(testUsername, testPassword);

		const invalidAccessToken = randomString(10);

		const response = await request.post(getVerifyUrl()).send({
			accessToken: invalidAccessToken,
		});

		expect(response.status).toBe(HTTP_UNAUTHORIZED_STATUS);
	});

	it('should not able to verify the token when the user id is not found', async () => {
		const testUsername = randomString(10);
		const testPassword = randomString(10);

		await createTestUser(testUsername, testPassword);

		const tokenizeService = ServiceContainer.getInstance().tokenizeService;
		const accessToken = await tokenizeService.generateAccessToken({
			id: 'invalid_id',
			username: testUsername,
			role: Role.USER,
		});

		const response = await request.post(getVerifyUrl()).send({
			accessToken,
		});

		expect(response.status).toBe(HTTP_NOT_FOUND_STATUS);
	});

	it('should not able to verify the access token when the access token is expired', async () => {
		const testUsername = randomString(10);
		const testPassword = randomString(10);
		const tokenizeService = new JwtTokenizeService();

		const accessToken = tokenizeService.generateToken(
			{
				id: 'expired_id',
				username: testUsername,
				role: Role.USER,
			},
			-1,
			Config.getInstance().jwt.accessTokenSecret,
		);

		await createTestUser(testUsername, testPassword);
		await verifyError(accessToken);
	});

	it('should able to refresh the access token', async () => {
		const testUsername = randomString(10);
		const testPassword = randomString(10);

		await createTestUser(testUsername, testPassword);
		const { accessToken, refreshToken } = await login(
			testUsername,
			testPassword,
		);

		const response = await request.post(getRefreshUrl()).send({
			accessToken,
			refreshToken,
		});

		expect(response.status).toBe(HTTP_OK_STATUS);
		expect(response.body.accessToken).toBeDefined();
		await verify(response.body.accessToken);
	});

	it('should not able to refresh the access token if the refresh token is invalid', async () => {
		const testUsername = randomString(10);
		const testPassword = randomString(10);

		await createTestUser(testUsername, testPassword);
		const { accessToken } = await login(testUsername, testPassword);

		const refreshToken = new JwtTokenizeService().generateToken(
			{
				id: 'invalid_id',
				username: testUsername,
				role: Role.USER,
			},
			-1,
			Config.getInstance().jwt.refreshTokenSecret,
		);

		const response = await request.post(getRefreshUrl()).send({
			accessToken,
			refreshToken,
		});

		expect(response.status).toBe(HTTP_UNAUTHORIZED_STATUS);
	});
});
