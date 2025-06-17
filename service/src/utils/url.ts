import { AUTH_URL, BASE_URL, LOGIN_URL } from '@/data/constants';

export function getLoginUrl() {
	return `${BASE_URL}/${AUTH_URL}/${LOGIN_URL}`;
}
