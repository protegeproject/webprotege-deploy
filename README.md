# webprotege-deploy

Docker Compose configuration for running WebProtege.

## Running WebProtege for the First Time

### Prerequisites

#### 1. Verify Docker Daemon is Running

Before beginning, ensure that the Docker daemon is active on your system.

**On macOS/Linux:**
```bash
docker info
```

**On Windows:**
- Open Docker Desktop application
- Verify the Docker icon in the system tray shows it's running
- Alternatively, open PowerShell and run `docker info`

If Docker isn't running, start it through Docker Desktop or your system's service manager. You should see output showing Docker system information when the daemon is properly running.

#### 2. Configure Local Host Resolution

WebProtege requires a custom local domain for proper operation. You'll need to modify your system's hosts file to redirect the custom domain to your local machine.

**Location of hosts file:**
- **Linux/macOS:** `/etc/hosts`
- **Windows:** `C:\Windows\System32\drivers\etc\hosts`

**Steps to modify:**
1. Open the hosts file with administrator/root privileges
   - **Linux/macOS:** `sudo nano /etc/hosts` or `sudo vim /etc/hosts`
   - **Windows:** Run Notepad as Administrator, then open the hosts file

2. Add these lines at the end of the file:
   ```
   127.0.0.1  webprotege-local.edu
   127.0.0.1  webprotege-events-history-service
   ```
3. Save and close the file

**What this does:** This configuration tells your computer that when any application tries to access `webprotege-local.edu`, it should connect to `127.0.0.1` (localhost) instead of trying to resolve it through DNS.

#### 3. Navigate to Project Directory and Set Environment Variable

Open a terminal and change to your local `webprotege-deploy` directory:

```bash
cd /path/to/your/webprotege-deploy
```

**Example paths:**
- **macOS/Linux:** `cd ~/Projects/webprotege-deploy`
- **Windows:** `cd C:\Users\YourUsername\Documents\webprotege-deploy`

Configure the `SERVER_HOST` environment variable:

**Linux/macOS (Bash/Zsh):**
```bash
export SERVER_HOST=webprotege-local.edu
```

**Windows (PowerShell):**
```powershell
$env:SERVER_HOST = "webprotege-local.edu"
```

**Windows (Command Prompt):**
```cmd
set SERVER_HOST=webprotege-local.edu
```

**Note:** This environment variable is temporary and only applies to your current terminal session. For permanent configuration, add it to your shell profile or use a `.env` file.

### Keycloak Setup

#### 4. Delete the Keycloak H2 Database Volume (Fresh Deploy Only)

Skip this step if deploying for the first time. For redeployments, this forces
Keycloak to start with a fresh database so the realm is re-imported cleanly.

```bash
docker volume rm webprotege-deploy_keycloak-h2-directory
```

#### 5. Start Keycloak

The Keycloak image is pre-built and published to Docker Hub as
`protegeproject/webprotege-keycloak`. It includes the custom login theme,
the authenticator plugin, and the realm configuration.

```bash
docker compose up -d keycloak
```

Wait for Keycloak to become healthy:

```bash
docker compose logs -f keycloak
```

Look for `Keycloak ... started in X.Xs`. Press Ctrl+C to stop following logs.

#### 6. Import the Realm Configuration

The `webprotege.json` realm file is baked into the Docker image at
`/opt/keycloak/import/webprotege.json`.

```bash
docker compose exec keycloak /opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:8080/keycloak --realm master --user admin --password password

docker compose exec keycloak /opt/keycloak/bin/kcadm.sh create realms \
  -f /opt/keycloak/import/webprotege.json
```

#### 7. Configure the `preferred_username` Protocol Mapper

The realm import does not preserve protocol mapper config for certain mapper types.
The `username` mapper in the `profile` scope (which maps `preferred_username` in the JWT)
must be recreated manually via the Admin CLI.

**7a.** Find the `profile` scope ID:

```bash
docker compose exec keycloak /opt/keycloak/bin/kcadm.sh get client-scopes \
  -r webprotege --fields id,name
```

Example output (look for the `profile` entry):

```
...
{
  "id" : "7e5f9070-523f-4081-af70-a2595e5f2910",
  "name" : "profile"
},
...
```

**7b.** Find the `username` mapper ID within that scope.
Replace `<PROFILE_SCOPE_ID>` with the ID from above (e.g., `7e5f9070-523f-4081-af70-a2595e5f2910`):

```bash
docker compose exec keycloak /opt/keycloak/bin/kcadm.sh get \
  client-scopes/<PROFILE_SCOPE_ID>/protocol-mappers/models \
  -r webprotege --fields id,name
```

Example output (look for the `username` entry):

```
...
{
  "id" : "741dbb53-3cda-4a25-a7c8-6e18ea5f163d",
  "name" : "username"
},
...
```

**7c.** Delete the existing `username` mapper.
Replace `<PROFILE_SCOPE_ID>` and `<USERNAME_MAPPER_ID>` with the IDs from above:

```bash
docker compose exec keycloak /opt/keycloak/bin/kcadm.sh delete \
  client-scopes/<PROFILE_SCOPE_ID>/protocol-mappers/models/<USERNAME_MAPPER_ID> \
  -r webprotege
```

**7d.** Create the new mapper that maps `mongo_id` to `preferred_username`.
The command will output the new mapper ID (e.g., `Created new model with id '...'`):

```bash
docker compose exec keycloak /opt/keycloak/bin/kcadm.sh create \
  client-scopes/<PROFILE_SCOPE_ID>/protocol-mappers/models \
  -r webprotege \
  -s name=username \
  -s protocol=openid-connect \
  -s protocolMapper=oidc-usermodel-attribute-mapper \
  -s consentRequired=false \
  -s 'config."user.attribute"=mongo_id' \
  -s 'config."id.token.claim"=true' \
  -s 'config."access.token.claim"=true' \
  -s 'config."claim.name"=preferred_username' \
  -s 'config."jsonType.label"=String' \
  -s 'config."userinfo.token.claim"=true'
```

This maps the Keycloak user attribute `mongo_id` to the `preferred_username` JWT claim,
allowing email addresses as Keycloak usernames while preserving the original MongoDB user ID
for internal application lookups.

#### 8. Verify the Mapper

Use the mapper ID returned from the create command in Step 7d.
Replace `<PROFILE_SCOPE_ID>` and `<NEW_MAPPER_ID>` accordingly:

```bash
docker compose exec keycloak /opt/keycloak/bin/kcadm.sh get \
  client-scopes/<PROFILE_SCOPE_ID>/protocol-mappers/models/<NEW_MAPPER_ID> \
  -r webprotege
```

> **Note:** Listing all mappers with `--fields config` shows empty config objects due to
> a kcadm.sh display bug in Keycloak 26.x. Always query a single mapper by ID to see the full config.

Confirm the output shows `"protocolMapper": "oidc-usermodel-attribute-mapper"`,
`"user.attribute": "mongo_id"`, and `"claim.name": "preferred_username"`.

### Launch WebProtege

#### 9. Start All Services

**Important for macOS users:** Before starting the services, macOS uses port 5000 for AirPlay Receiver by default, which conflicts with Logstash. You need to modify the Docker Compose configuration:

1. Open `docker-compose.yml` in a text editor
2. Find the Logstash port mapping for port 5000
3. Change the host port from `5000` to `5001` (or any other available port)

**Example change:**
```yaml
# Before:
ports:
  - "5000:5000/tcp"
  - "5000:5000/udp"

# After:
ports:
  - "5001:5000/tcp"
  - "5001:5000/udp"
```

Now start all services:

```bash
docker compose up -d
```

#### 10. Access WebProtege

Open your browser and go to:

```
http://webprotege-local.edu
```

Use the custom domain (not `localhost`) to ensure proper cookie handling and
authentication flow between WebProtege and Keycloak.

#### 11. Register a New User Account

Since this is your first time using WebProtege, create a new account:

1. Click "Register" on the login page
2. Fill out the registration form with:
   - **Email:** Your email address
   - **Password:** A strong password following any displayed requirements
   - **Confirm Password:** Re-enter your password
   - **First/Last Name:** Your display name within WebProtege
3. Click "Register"

#### 12. Sign Into Your New Account

After registration, sign in using your newly created credentials:

1. Enter your email and password
2. Click "Sign In"

**Successful login indicators:**
- Redirect to the WebProtege home page
- Your name appears in the top navigation
- You see options to create or access ontology projects

### Verification

After logging in, you should see the WebProtege home page with options to
create or access ontology projects.

To verify the `mongo_id` mapper is working correctly, check the backend logs:

```bash
docker compose logs webprotege-backend-service | grep "from user"
```

The userId should show the `mongo_id` value (e.g., `johardi`), not the email address.

### Troubleshooting

**Port conflicts:** If port 8080 is already in use, modify the Docker Compose configuration to use alternative ports.

**Permission errors:** Ensure your user has permissions to modify the hosts file and run Docker commands.

**Service startup failures:** Check Docker logs for specific error messages: `docker compose logs <service-name>`

**Authentication issues:** Verify the realm was imported correctly and that `SERVER_HOST` matches your hosts file entry.

## SMTP Configuration

WebProtege requires an SMTP server for the migrated user password reset flow. In development,
Mailpit is included in docker-compose.yml. The SMTP settings are defined in the realm JSON
(`webprotege.json`) under `smtpServer`.
