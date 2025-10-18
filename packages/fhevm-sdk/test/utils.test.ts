import { describe, it, expect } from 'vitest';
import {
    sleep,
    getDefaultTimeout,
} from '../src/universal/utils';

describe('Utility Functions', () => {
    describe('sleep', () => {
        it('should delay execution', async () => {
            const start = Date.now();
            await sleep(100);
            const elapsed = Date.now() - start;

            expect(elapsed).toBeGreaterThanOrEqual(90); // Allow small variance
        });
    });

    describe('getDefaultTimeout', () => {
        it('should return default timeout value', () => {
            expect(getDefaultTimeout()).toBe(30000);
        });
    });
});
