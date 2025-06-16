import { add } from './test_utils.ts';
import { expect, jest, test } from '@jest/globals';

describe('test_utils', () => {
	test('add', () => {
		expect(add(1, 2)).toBe(3);
		expect(add(1, 2)).not.toBe(4);
	});
});
