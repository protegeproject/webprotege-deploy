# webprotege-deploy

This repository houses docker compose and related files for running WebProtégé.  

For a basic Docker Compose file see [docker-compose.yml](https://github.com/protegeproject/webprotege-deploy/blob/main/docker-compose.yml).

For a Keycloak configuration file see [keycloak/webprotege.json](https://github.com/protegeproject/webprotege-deploy/blob/main/keycloak/webprotege.json)

add in etc/hosts 127.0.0.1  webprotege-local.edu

## Running WebProtégé for the first time

1. Make sure you have the docker daemon running.
2. Open your `/etc/hosts` file in a text editor and add a new line containing `127.0.0.1  webprotege-local.edu`.
3. Open a terminal in your local `webprotege-deploy` directory.
4. Set the `SERVER_HOST` environment variable to `webprotege-local.edu`.
5. Start the keycloak service: `docker compose up keycloak -d`.
6. Open a browser and navigate to `http://localhost:8080`.  You will be shown the keycloak admin page.
7. Sign into keycloak using the default user name (`admin`) and the default password (`password`).
8. Sign out of keycloak admin.
9. When you are signed into keycloak, create a new realm by importing the `keycloak/webprotege.json` configuration file.
10. Start the rest of webprotege using docker compose, `docker compose up`.
11. Navigate to `http://webprotege-local.edu` in your web browser. You will be shown the sign in page for WebProtégé.
12. Register a new account for yourself.
13. Sign into the new account.  You should then be able to see the WebProtégé home page.
