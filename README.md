# webprotege-deploy

This repository houses docker compose and related files for running WebProtégé.  

For a basic Docker Compose file see [docker-compose.yml](https://github.com/protegeproject/webprotege-deploy/blob/main/docker-compose.yml).

For a Keycloak configuration file see [keycloak/webprotege.json](https://github.com/protegeproject/webprotege-deploy/blob/main/keycloak/webprotege.json)

add in etc/hosts 127.0.0.1  webprotege-local.edu

## Running WebProtégé for the First Time

This guide will walk you through setting up WebProtégé using Docker.

### Prerequisites and Initial Setup

#### 1. Verify Docker Daemon is Running

Before beginning, ensure that the Docker daemon is active on your system. The Docker daemon is the background service that manages Docker containers and images.

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

WebProtégé requires a custom local domain for proper operation. You'll need to modify your system's hosts file to redirect the custom domain to your local machine.

**Location of hosts file:**
- **Linux/macOS:** `/etc/hosts`
- **Windows:** `C:\Windows\System32\drivers\etc\hosts`

**Steps to modify:**
1. Open the hosts file with administrator/root privileges
   - **Linux/macOS:** `sudo nano /etc/hosts` or `sudo vim /etc/hosts`
   - **Windows:** Run Notepad as Administrator, then open the hosts file

2. Add this exact line at the end of the file:
   ```
   127.0.0.1  webprotege-local.edu
   127.0.0.1  webprotege-events-history-service
   ```
3. Save and close the file

**What this does:** This configuration tells your computer that when any application tries to access `webprotege-local.edu`, it should connect to `127.0.0.1` (localhost) instead of trying to resolve it through DNS.

### Docker Environment Setup

#### 3. Navigate to Project Directory

Open a terminal or command prompt and change to your local `webprotege-deploy` directory. This directory should contain the Docker Compose configuration files necessary for running WebProtégé.

```bash
cd /path/to/your/webprotege-deploy
```

**Example paths:**
- **macOS/Linux:** `cd ~/Projects/webprotege-deploy`
- **Windows:** `cd C:\Users\YourUsername\Documents\webprotege-deploy`

#### 4. Set Environment Variable

Configure the `SERVER_HOST` environment variable to match the custom domain you added to your hosts file. This tells WebProtégé which hostname to expect for incoming requests.

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

**Note:** This environment variable is temporary and only applies to your current terminal session. For permanent configuration, you can add it to your shell profile or use a `.env` file if supported by your Docker Compose setup.

### Keycloak Authentication Setup

WebProtégé uses Keycloak as its identity and access management solution. Keycloak must be configured before starting the main WebProtégé services.

#### 5. Start Keycloak Service

Launch only the Keycloak service initially to configure authentication before starting other services:

```bash
docker compose up keycloak -d
```

**Command breakdown:**
- `docker compose up`: Starts services defined in docker-compose.yml
- `keycloak`: Specifies only the keycloak service
- `-d`: Runs in detached mode (background), freeing up your terminal

**Expected output:**
```
[+] Running 1/1
 ✔ Container webprotege-deploy-keycloak-1  Started
```

Wait a few moments for Keycloak to fully initialize. You can check the logs with:
```bash
docker compose logs keycloak
```

#### 6. Access Keycloak Admin Interface

Open your web browser and navigate to:
```
http://localhost:8080
```

You should see the Keycloak administration console welcome page. If you see an error or connection refused message, wait a bit longer for Keycloak to finish starting up.

**Troubleshooting:**
- If the page doesn't load, check that Keycloak is running: `docker compose ps`
- Review logs for errors: `docker compose logs keycloak`

#### 7. Sign Into Keycloak Admin

Use the default administrator credentials to access the Keycloak admin console:

- **Username:** `admin`
- **Password:** `password`

**Security Note:** These are default credentials for local development. In a production environment, you should immediately change these credentials and use strong, unique passwords.

Once logged in, you'll see the Keycloak administration dashboard with options to manage realms, users, and authentication settings.

#### 8. Import WebProtégé Realm Configuration

A "realm" in Keycloak is a security domain that manages users, credentials, and roles for a specific application or set of applications.

**Steps to import:**
1. In the left sidebar, hover over the realm dropdown (likely showing "Master")
2. Click "Create Realm" or "Add realm"
3. Choose "Import" or "Browse" option
4. Navigate to and select the `keycloak/webprotege.json` file from your webprotege-deploy directory
5. Click "Create" or "Import"

**What this configuration includes:**
- WebProtégé client configuration
- Required authentication flows
- User roles and permissions
- Login themes and settings

After importing, you should see "webprotege" appear in the realm dropdown, indicating successful configuration.

### Launch WebProtégé Services

#### 9. Start All WebProtégé Services

**Important for macOS users:** Before starting the services, you need to modify the Docker Compose configuration to avoid port conflicts. macOS uses port 5000 for AirPlay Receiver by default.

**Port modification steps:**
1. Open the `docker-compose.yml` file in a text editor
2. Navigate to approximately line 320-321 in the logstash section
3. Change the port mapping from `5000:5000` to `5001:5000` (or any other 500x port like 5002, 5003, etc.)
4. Save the file

**Example change:**
```yaml
# Before (line 320-321):
ports:
  - "5000:5000/tcp"
  - "5000:5000/udp"

# After:
ports:
  - "5001:5000/tcp"
  - "5001:5000/udp"
```

Now that Keycloak is configured, start the complete WebProtégé application stack:

```bash
docker compose up
```

**What this command does:**
- Starts all services defined in the Docker Compose file
- Includes the database, backend services, frontend, and any other required components
- Runs in foreground mode, showing logs from all services

**Startup time:** Initial startup may take several minutes as Docker downloads images and initializes databases. Watch the logs for "ready" or "started" messages from each service.

### Access and Account Setup

#### 10. Navigate to WebProtégé Application

Open your web browser and go to:
```
http://webprotege-local.edu
```

**Important:** Use the custom domain you configured in your hosts file, not `localhost`. This ensures proper cookie handling and authentication flow between WebProtégé and Keycloak.

You should see the WebProtégé sign-in page with options to log in or register a new account.

#### 11. Register a New User Account

Since this is your first time using WebProtégé, create a new account:

1. Click "Register" on the login page
2. Fill out the registration form with:
   - **Username:** Choose a unique username (e.g., your email or preferred handle)
   - **Password:** A strong password following any displayed requirements
   - **Confirm Password:** Re-enter your password
   - **Email:** Your email address (required for account verification and notifications)
   - **First/Last Name:** Your display name within WebProtégé

3. Click "Register"

#### 12. Sign Into Your New Account

After registration, sign in using your newly created credentials:

1. Enter your username/email and password
2. Click "Sign In"

**Successful login indicators:**
- Redirect to the WebProtégé home page
- Your username appears in the top navigation
- You see options to create or access ontology projects

### Verification and Next Steps

After completing these steps, you should see the WebProtégé home page, which typically includes:

- **Project dashboard:** View and manage your ontology projects
- **Create project button:** Start new ontology development projects
- **User profile access:** Manage your account settings
- **Navigation menu:** Access different WebProtégé features

**Common next steps:**
- Create your first ontology project
- Import existing ontology files
- Explore WebProtégé documentation and tutorials
- Configure project-specific settings and collaborator access

### Troubleshooting Common Issues

**Port conflicts:** If port 8080 is already in use, modify the Docker Compose configuration to use alternative ports.

**Permission errors:** Ensure your user has permissions to modify the hosts file and run Docker commands.

**Service startup failures:** Check Docker logs for specific error messages and ensure all required files are present in the webprotege-deploy directory.

**Authentication issues:** Verify the realm was imported correctly in Keycloak and that the SERVER_HOST environment variable matches your hosts file entry.
