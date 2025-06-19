export function getTokenFromHeader(header: string) {
	return header.split(' ')[1];
}

export function getAuthenHeaderValueFromToken(token: string) {
	return `Bearer ${token}`;
}
