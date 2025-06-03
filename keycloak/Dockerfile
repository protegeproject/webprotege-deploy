FROM keycloak/keycloak:26.1

# Enable health checks and management interface
RUN /opt/keycloak/bin/kc.sh build --health-enabled=true --http-management-enabled=true

EXPOSE 8080 9000

COPY ./webprotege.v2 /opt/keycloak/themes/webprotege.v2