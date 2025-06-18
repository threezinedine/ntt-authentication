import {
	AUTH_URL,
	BASE_URL,
	LOGIN_URL,
	REGISTER_URL,
	VERIFY_URL,
} from '@/data/constants';

export function getLoginUrl() {
	return `/${BASE_URL}/${AUTH_URL}/${LOGIN_URL}`;
}

export function getRegisterUrl() {
	return `/${BASE_URL}/${AUTH_URL}/${REGISTER_URL}`;
}

export function getVerifyUrl() {
	return `/${BASE_URL}/${AUTH_URL}/${VERIFY_URL}`;
}
