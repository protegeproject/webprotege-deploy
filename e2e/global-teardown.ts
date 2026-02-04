import { type FullConfig } from '@playwright/test';
import { deleteAllTestUsers } from './helpers/keycloak-admin';
import { TEST_USER_PREFIX } from './helpers/test-data';

async function globalTeardown(_config: FullConfig) {
  console.log(`[Global Teardown] Deleting all test users with prefix '${TEST_USER_PREFIX}'...`);
  try {
    const deleted = await deleteAllTestUsers(TEST_USER_PREFIX);
    console.log(`[Global Teardown] Deleted ${deleted} test user(s).`);
  } catch (error) {
    console.error('[Global Teardown] Failed to clean up test users:', error);
  }
}

export default globalTeardown;
