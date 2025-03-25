FROM keycloak/keycloak:26.1

WORKDIR /opt/keycloak

USER root

# Copy the RabbitMQ event listener JAR
COPY keycloak-to-rabbit-*.jar /opt/keycloak/providers/

# Ensure proper permissions
RUN chmod 644 /opt/keycloak/providers/keycloak-to-rabbit-*.jar

USER keycloak

# Start Keycloak in development mode
ENTRYPOINT ["/opt/keycloak/bin/kc.sh", "start-dev"]
