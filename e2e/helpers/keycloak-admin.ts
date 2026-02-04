import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '..', '.env.test') });

const KEYCLOAK_BASE_URL = process.env.KEYCLOAK_BASE_URL || 'http://webprotege-local.edu/keycloak';
const REALM = process.env.KEYCLOAK_REALM || 'webprotege';
const ADMIN_USERNAME = process.env.KEYCLOAK_ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.KEYCLOAK_ADMIN_PASSWORD || 'password';
const ADMIN_CLIENT_ID = process.env.KEYCLOAK_ADMIN_CLIENT_ID || 'admin-cli';

export async function getAdminToken(): Promise<string> {
  const tokenUrl = `${KEYCLOAK_BASE_URL}/realms/master/protocol/openid-connect/token`;
  const body = new URLSearchParams({
    grant_type: 'password',
    client_id: ADMIN_CLIENT_ID,
    username: ADMIN_USERNAME,
    password: ADMIN_PASSWORD,
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to get admin token: ${response.status} ${text}`);
  }

  const data = await response.json();
  return data.access_token;
}

interface KeycloakUser {
  id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export async function findUserByUsername(username: string): Promise<KeycloakUser | null> {
  const token = await getAdminToken();
  const url = `${KEYCLOAK_BASE_URL}/admin/realms/${REALM}/users?username=${encodeURIComponent(username)}&exact=true`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to find user: ${response.status}`);
  }

  const users: KeycloakUser[] = await response.json();
  return users.length > 0 ? users[0] : null;
}

export async function findUsersByPrefix(prefix: string): Promise<KeycloakUser[]> {
  const token = await getAdminToken();
  const url = `${KEYCLOAK_BASE_URL}/admin/realms/${REALM}/users?username=${encodeURIComponent(prefix)}&first=0&max=100`;

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    throw new Error(`Failed to find users by prefix: ${response.status}`);
  }

  const users: KeycloakUser[] = await response.json();
  return users.filter((u) => u.username.startsWith(prefix));
}

export async function deleteUserById(userId: string): Promise<void> {
  const token = await getAdminToken();
  const url = `${KEYCLOAK_BASE_URL}/admin/realms/${REALM}/users/${userId}`;

  const response = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok && response.status !== 404) {
    throw new Error(`Failed to delete user ${userId}: ${response.status}`);
  }
}

export async function deleteUserByUsername(username: string): Promise<boolean> {
  const user = await findUserByUsername(username);
  if (user) {
    await deleteUserById(user.id);
    return true;
  }
  return false;
}

export async function deleteAllTestUsers(prefix: string): Promise<number> {
  const users = await findUsersByPrefix(prefix);
  let deleted = 0;
  for (const user of users) {
    await deleteUserById(user.id);
    deleted++;
  }
  return deleted;
}
