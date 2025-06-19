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
import TestHelpers from './helpers';

describe('Authentication testing', () => {
	const testHelpers = TestHelpers.getInstance();

	beforeAll(async () => {
		await testHelpers.setup();
	});

	afterAll(async () => {
		await testHelpers.teardown();
	});

	it('should return error when the username is not provided', async () => {
		const response = await testHelpers.request.post(getLoginUrl()).send({
			password: '123456',
		});

		expect(response.status).toBe(HTTP_BAD_REQUEST_STATUS);
	});

	it('should return error when the password is not provided', async () => {
		const response = await testHelpers.request.post(getLoginUrl()).send({
			username: 'test',
		});

		expect(response.status).toBe(HTTP_BAD_REQUEST_STATUS);
	});

	it('should return access token when the username and password are provided', async () => {
		const testUsername = randomString(10);
		const testPassword = randomString(10);

		await testHelpers.createTestUser(testUsername, testPassword);

		const response = await testHelpers.request.post(getLoginUrl()).send({
			username: testUsername,
			password: testPassword,
		});

		expect(response.status).toBe(HTTP_OK_STATUS);
		expect(response.body.accessToken).toBeDefined();
		expect(response.body.refreshToken).toBeDefined();
	});

	it('should return error when the username is already taken in register api', async () => {
		const response = await testHelpers.request.post(getRegisterUrl()).send({
			password: '123456',
		});

		expect(response.status).toBe(HTTP_BAD_REQUEST_STATUS);
	});

	it('should return error when the password is not provided in register api', async () => {
		const response = await testHelpers.request.post(getRegisterUrl()).send({
			username: 'test',
		});

		expect(response.status).toBe(HTTP_BAD_REQUEST_STATUS);
	});

	it('should create a new user when the request is valid in register api', async () => {
		const testUsername = randomString(10);
		const testPassword = randomString(10);

		const response = await testHelpers.request.post(getRegisterUrl()).send({
			username: testUsername,
			password: testPassword,
		});

		expect(response.status).toBe(HTTP_CREATED_STATUS);

		const loginResponse = await testHelpers.request
			.post(getLoginUrl())
			.send({
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

		await testHelpers.createTestUser(testUsername, testPassword);

		const loginResponse = await testHelpers.request
			.post(getLoginUrl())
			.send({
				username: testUsername,
				password: 'wrong_password',
			});

		expect(loginResponse.status).toBe(HTTP_UNAUTHORIZED_STATUS);
	});

	it('should return error when the user is not found', async () => {
		const response = await testHelpers.request.post(getLoginUrl()).send({
			username: 'not_found',
			password: '123456',
		});

		expect(response.status).toBe(HTTP_NOT_FOUND_STATUS);
	});

	it('should login and the access token is verified', async () => {
		const testUsername = randomString(10);
		const testPassword = randomString(10);

		await testHelpers.createTestUser(testUsername, testPassword);
		const { accessToken } = await testHelpers.login(
			testUsername,
			testPassword,
		);

		const response = await testHelpers.request.post(getVerifyUrl()).send({
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

		await testHelpers.createTestUser(testUsername, testPassword);

		const invalidAccessToken = randomString(10);

		const response = await testHelpers.request.post(getVerifyUrl()).send({
			accessToken: invalidAccessToken,
		});

		expect(response.status).toBe(HTTP_UNAUTHORIZED_STATUS);
	});

	it('should not able to verify the token when the user id is not found', async () => {
		const testUsername = randomString(10);
		const testPassword = randomString(10);

		await testHelpers.createTestUser(testUsername, testPassword);

		const tokenizeService = ServiceContainer.getInstance().tokenizeService;
		const accessToken = await tokenizeService.generateAccessToken({
			id: 'invalid_id',
			username: testUsername,
			role: Role.USER,
		});

		const response = await testHelpers.request.post(getVerifyUrl()).send({
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

		await testHelpers.createTestUser(testUsername, testPassword);
		await testHelpers.verifyError(accessToken);
	});

	it('should able to refresh the access token', async () => {
		const testUsername = randomString(10);
		const testPassword = randomString(10);

		await testHelpers.createTestUser(testUsername, testPassword);
		const { accessToken, refreshToken } = await testHelpers.login(
			testUsername,
			testPassword,
		);

		const response = await testHelpers.request.post(getRefreshUrl()).send({
			accessToken,
			refreshToken,
		});

		expect(response.status).toBe(HTTP_OK_STATUS);
		expect(response.body.accessToken).toBeDefined();
		await testHelpers.verify(response.body.accessToken);
	});

	it('should not able to refresh the access token if the refresh token is invalid', async () => {
		const testUsername = randomString(10);
		const testPassword = randomString(10);

		await testHelpers.createTestUser(testUsername, testPassword);
		const { accessToken } = await testHelpers.login(
			testUsername,
			testPassword,
		);

		const refreshToken = new JwtTokenizeService().generateToken(
			{
				id: 'invalid_id',
				username: testUsername,
				role: Role.USER,
			},
			-1,
			Config.getInstance().jwt.refreshTokenSecret,
		);

		const response = await testHelpers.request.post(getRefreshUrl()).send({
			accessToken,
			refreshToken,
		});

		expect(response.status).toBe(HTTP_UNAUTHORIZED_STATUS);
	});

	it('should already has a super admin user at the start', async () => {
		const response = await testHelpers.request.post(getLoginUrl()).send({
			username: Config.getInstance().superAdmin.username,
			password: Config.getInstance().superAdmin.password,
		});

		expect(response.status).toBe(HTTP_OK_STATUS);
	});
});
