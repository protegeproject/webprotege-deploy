export const TEST_USER_PREFIX = 'wp_test_';

export const PRIMARY_TEST_USER = {
  firstName: 'Test',
  lastName: 'User',
  email: `${TEST_USER_PREFIX}primary@example.com`,
  username: `${TEST_USER_PREFIX}primary`,
  password: 'TestPassword123!',
};

export const INVALID_CREDENTIALS = {
  username: 'nonexistent_user_xyz',
  password: 'WrongPassword999!',
};

export interface TestUser {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  password: string;
}

export function createUniqueTestUser(label: string): TestUser {
  const timestamp = Date.now();
  const uniqueId = `${TEST_USER_PREFIX}${label}_${timestamp}`;
  return {
    firstName: 'Test',
    lastName: label.charAt(0).toUpperCase() + label.slice(1),
    email: `${uniqueId}@example.com`,
    username: uniqueId,
    password: 'TestPassword123!',
  };
}
