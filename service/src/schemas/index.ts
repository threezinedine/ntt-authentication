export type ErrorResponse = {
	message: string;
};

export type LoginRequest = {
	username: string;
	password: string;
};

export type LoginResponse = {
	accessToken: string;
	refreshToken: string;
};

export type RegisterRequest = LoginRequest;
export type RegisterResponse = {};

export type VerifyRequest = {
	accessToken: string;
};

export type VerifyResponse = {};
