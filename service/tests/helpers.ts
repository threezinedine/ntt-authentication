import App from '@/app';
import Config from '@/config';
import {
	AUTHORIZATION_HEADER,
	HTTP_OK_STATUS,
	HTTP_UNAUTHORIZED_STATUS,
} from '@/data';
import { User } from '@/models';
import { TokenData } from '@/services/tokenize';
import {
	getAuthenHeaderValueFromToken,
	getLoginUrl,
	getMoveToAdminUrl,
	getRegisterUrl,
	getVerifyUrl,
} from '@/utils';
import supertest from 'supertest';
import TestAgent from 'supertest/lib/agent';

class TestHelpers {
	private static instance: TestHelpers;

	static getInstance() {
		if (!TestHelpers.instance) {
			TestHelpers.instance = new TestHelpers();
		}

		return TestHelpers.instance;
	}

	private app: App;
	public request: TestAgent;

	constructor() {
		this.app = App.getInstance();
	}

	async setup() {
		await this.app.setup();
		this.app.setupRoutes();
		this.request = supertest(this.app.app);
	}

	async teardown() {
		await this.app.teardown();
	}

	async createTestUser(username: string, password: string) {
		await this.request.post(getRegisterUrl()).send({
			username,
			password,
		});
	}

	async login(
		username: string,
		password: string,
	): Promise<{ accessToken: string; refreshToken: string }> {
		const response = await this.request.post(getLoginUrl()).send({
			username,
			password,
		});

		return {
			accessToken: response.body.accessToken,
			refreshToken: response.body.refreshToken,
		};
	}

	async loginAndGetUserId(
		username: string,
		password: string,
	): Promise<string> {
		const { accessToken } = await this.login(username, password);
		const user = (await this.verify(accessToken)) as User;
		return user.id;
	}

	async createTestUserAndGetUserId(
		username: string,
		password: string,
	): Promise<{ userId: string; accessToken: string }> {
		await this.createTestUser(username, password);
		const { accessToken } = await this.login(username, password);
		const user = (await this.verify(accessToken)) as User;
		return { userId: user.id, accessToken };
	}

	async loginSuperAdmin(): Promise<string> {
		const { accessToken } = await this.login(
			Config.getInstance().superAdmin.username,
			Config.getInstance().superAdmin.password,
		);
		return accessToken;
	}

	async verify(accessToken: string): Promise<User> {
		const response = await this.request.post(getVerifyUrl()).send({
			accessToken,
		});

		expect(response.status).toBe(HTTP_OK_STATUS);
		expect(response.body.id).toBeDefined();
		expect(response.body.username).toBeDefined();
		expect(response.body.role).toBeDefined();

		return response.body as User;
	}

	async verifyError(
		accessToken: string,
		status: number = HTTP_UNAUTHORIZED_STATUS,
	): Promise<void> {
		const response = await this.request.post(getVerifyUrl()).send({
			accessToken,
		});

		expect(response.status).toBe(status);
		expect(response.body.message).toBeDefined();
	}

	async moveToAdmin(userId: string): Promise<supertest.Response> {
		const superAdminAccessToken = await this.loginSuperAdmin();
		return await this.request
			.put(getMoveToAdminUrl())
			.send({ userId })
			.set(
				AUTHORIZATION_HEADER,
				getAuthenHeaderValueFromToken(superAdminAccessToken),
			);
	}
}

export default TestHelpers;
