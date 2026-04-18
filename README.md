# webprotege-deploy

Docker Compose configuration for running WebProtege.

## Quick Start

```bash
cp .env.example .env
docker compose up -d
```

Then open http://webprotege-local.edu in your browser, click **Register**
to create an account, and sign in.

> **First time?**  You need to add `webprotege-local.edu` to your hosts
> file before this will work.  See [Configure Local Host Resolution](#configure-local-host-resolution)
> below.

## Prerequisites

### Docker

The Docker daemon must be running.  Verify with:

```bash
docker info
```

If this fails, start Docker through Docker Desktop or your system's
service manager.

### Configure Local Host Resolution

WebProtege uses a custom hostname for cookie handling and Keycloak
authentication flows.  Add this line to your system's hosts file:

```
127.0.0.1  webprotege-local.edu
```

**Hosts file location:**
- **Linux/macOS:** `/etc/hosts` (edit with `sudo nano /etc/hosts`)
- **Windows:** `C:\Windows\System32\drivers\etc\hosts` (edit as Administrator)

Self-hosted deployments using their own domain can skip this step and set
`SERVER_HOST` in `.env` to their public hostname instead.

### Environment Configuration

Copy the example environment file:

```bash
cp .env.example .env
```

The defaults are suitable for local development.  Self-hosted deployments
should edit `.env` and change `SERVER_HOST` to the public hostname.

See `.env.example` for documentation of each variable.

## Starting WebProtege

Start all services:

```bash
docker compose up -d
```

Keycloak will automatically import the WebProtege realm, configure
the protocol mappers, and set up redirect URIs on first boot.  This
is handled by the [webprotege-keycloak](https://github.com/protegeproject/webprotege-keycloak)
image's entrypoint script — no manual Keycloak setup is required.

To follow startup progress:

```bash
docker compose logs -f webprotege-keycloak
```

Look for `[entrypoint] Realm configuration complete.` to confirm the
realm is ready.  Press Ctrl+C to stop following logs.

## Accessing WebProtege

Open your browser and go to:

```
http://webprotege-local.edu
```

Use the custom domain (not `localhost`) to ensure proper cookie handling
and authentication flow between WebProtege and Keycloak.

### Register a New User Account

1. Click **Register** on the login page
2. Fill out the registration form (email, password, name)
3. Click **Register**

### Sign In

After registration, sign in with your email and password.

**Successful login indicators:**
- Redirect to the WebProtege home page
- Your name appears in the top navigation
- You see options to create or access ontology projects

## First-Admin Bootstrap

On a fresh install, no user has administrative access. The first registered
user must be granted the `SystemAdmin` role in Keycloak before WebProtege's
admin features (creating projects, managing users, editing application
settings) become available.

This is a one-time manual step per install. A config-driven alternative is
tracked in
[webprotege-authorization-service#36](https://github.com/protegeproject/webprotege-authorization-service/issues/36).

### Grant the SystemAdmin role

1. Sign in to the Keycloak admin console at:

   ```
   http://webprotege-local.edu/keycloak/admin/
   ```

   Use the credentials from `KEYCLOAK_ADMIN` and `KEYCLOAK_ADMIN_PASSWORD`
   in your `.env` file.  **Change these from the defaults before any
   deployment that is reachable beyond your local machine.**

2. In the left sidebar, switch the realm dropdown from `master` to
   `webprotege`.

3. Navigate to **Clients → webprotege → Roles → SystemAdmin → Users in role**
   (or **Assign users**, depending on Keycloak version).

4. Assign the role to the user account you registered earlier.

5. Sign out of WebProtege and sign back in — the new role is picked up from
   the fresh JWT.  You now have full admin access.

### Enable self-service project creation

By default, only users with an explicit `ProjectCreator` role assignment can
create new projects.  To let any signed-in user create projects:

1. In WebProtege, navigate to **Application Settings** (admin menu).
2. Enable **Empty project creation allowed**.
3. Save.

## Services

The stack includes the following services:

| Service | Description | Port |
|---|---|---|
| webprotege-nginx | Reverse proxy (entry point) | 80 |
| webprotege-keycloak | Identity and access management | 8080 |
| mongo | MongoDB database | 27017 |
| rabbitmq | Message broker | 5672, 15672 |
| minio | Object storage | 9000, 9001 |
| elasticsearch | Log storage | 9200 |
| logstash | Log pipeline | 5044 |
| filebeat | Log shipper | — |
| kibana | Log dashboard | 5601 |
| mailpit | Development SMTP server | 1025, 8025 |
| webprotege-gwt-api-gateway | API gateway | 5008 |
| webprotege-gwt-ui-server | Web UI | 8888 |
| webprotege-backend-service | Core backend | 5005 |
| webprotege-authorization-service | Authorization | 5010 |
| webprotege-user-management-service | User management | — |
| webprotege-event-history-service | Event history | 5006 |
| webprotege-ontology-processing-service | Ontology processing | — |
| webprotege-initial-revision-history-service | Revision history | — |

## Stopping and Resetting

**Stop all services** (preserves data):

```bash
docker compose down
```

**Stop and delete all data** (full reset):

```bash
docker compose down -v
```

**Reset Keycloak only** (forces realm re-import on next start):

```bash
docker compose down
docker volume rm webprotege-deploy_keycloak-h2-directory
docker compose up -d
```

## Verification

To verify the `webprotege_username` mapper is working correctly, check
the backend logs after signing in:

```bash
docker compose logs webprotege-backend-service | grep "from user"
```

The userId should show the `webprotege_username` value (e.g., `johardi`),
not the email address.

## Troubleshooting

**Port conflicts:** If a port is already in use, check which service
uses that port in the table above and modify the host port mapping in
`docker-compose.yml`.

**Permission errors:** Ensure your user has permissions to modify the
hosts file and run Docker commands.

**Service startup failures:** Check logs for a specific service:

```bash
docker compose logs <service-name>
```

**Authentication issues:** Verify that `SERVER_HOST` in `.env` matches
your hosts file entry.  Check the Keycloak entrypoint logs:

```bash
docker compose logs webprotege-keycloak | grep "\[entrypoint\]"
```

## SMTP Configuration

WebProtege requires an SMTP server for the migrated user password reset
flow.  In development, Mailpit is included in docker-compose.yml and
catches all outgoing email.  Access the Mailpit inbox at
http://webprotege-local.edu:8025.

The SMTP settings are defined in the Keycloak realm JSON
(`webprotege.json`) under `smtpServer`.
