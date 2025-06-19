import { describe, it, expect, beforeAll } from '@jest/globals';
import TestHelpers from './helpers';
import {
	getAuthenHeaderValueFromToken,
	getMoveToAdminUrl,
	randomString,
} from '@/utils';
import { User } from '@/models';
import Config from '@/config';
import {
	AUTHORIZATION_HEADER,
	HTTP_CONFLICT_STATUS,
	HTTP_FORBIDDEN_STATUS,
	HTTP_NOT_FOUND_STATUS,
	HTTP_OK_STATUS,
	HTTP_UNAUTHORIZED_STATUS,
	Role,
} from '@/data';

describe('Authentication service testing', () => {
	const testHelpers = TestHelpers.getInstance();

	beforeAll(async () => {
		await testHelpers.setup();
	});

	afterAll(async () => {
		await testHelpers.teardown();
	});

	it('super user can move user to admin role', async () => {
		const testUsername = randomString(10);
		const testPassword = randomString(10);

		const { userId, accessToken: testUserAccessToken } =
			await testHelpers.createTestUserAndGetUserId(
				testUsername,
				testPassword,
			);

		const response = await testHelpers.moveToAdmin(userId);

		expect(response.status).toBe(HTTP_OK_STATUS);
		const { accessToken: newAccessToken } = await testHelpers.login(
			testUsername,
			testPassword,
		);

		const user = await testHelpers.verify(newAccessToken);
		expect(user.role).toBe(Role.ADMIN);
	});

	it('should not able to use the access token if the role has been modified', async () => {
		const testUsername = randomString(10);
		const testPassword = randomString(10);

		const { userId, accessToken: testUserAccessToken } =
			await testHelpers.createTestUserAndGetUserId(
				testUsername,
				testPassword,
			);

		await testHelpers.moveToAdmin(userId);

		await testHelpers.verifyError(
			testUserAccessToken,
			HTTP_CONFLICT_STATUS,
		);
	});

	it('should not able to move user to admin role if the user is not found', async () => {
		const response = await testHelpers.moveToAdmin(randomString(10));
		expect(response.status).toBe(HTTP_NOT_FOUND_STATUS);
	});

	it('should not able to move a user to admin if the user is already an admin', async () => {
		const testUsername = randomString(10);
		const testPassword = randomString(10);

		const { userId } = await testHelpers.createTestUserAndGetUserId(
			testUsername,
			testPassword,
		);

		await testHelpers.moveToAdmin(userId);

		const response = await testHelpers.moveToAdmin(userId);
		expect(response.status).toBe(HTTP_CONFLICT_STATUS);
	});

	it('should not able to move a user to admin if the user is not a super admin', async () => {
		const testUsername = randomString(10);
		const testPassword = randomString(10);

		const modifiedTestUsername = randomString(10);
		const modifiedTestPassword = randomString(10);

		const { userId } = await testHelpers.createTestUserAndGetUserId(
			testUsername,
			testPassword,
		);

		const { userId: modifiedUserId } =
			await testHelpers.createTestUserAndGetUserId(
				modifiedTestUsername,
				modifiedTestPassword,
			);

		const { accessToken: newAccessToken } = await testHelpers.login(
			testUsername,
			testPassword,
		);

		const response = await testHelpers.request
			.put(getMoveToAdminUrl())
			.send({ userId: modifiedUserId })
			.set(
				AUTHORIZATION_HEADER,
				getAuthenHeaderValueFromToken(newAccessToken),
			);

		expect(response.status).toBe(HTTP_FORBIDDEN_STATUS);
	});
});
