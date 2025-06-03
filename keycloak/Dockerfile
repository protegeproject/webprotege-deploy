FROM keycloak/keycloak:26.1

# Enable health checks
RUN /opt/keycloak/bin/kc.sh build --health-enabled=true

EXPOSE 8080

COPY ./webprotege.v2 /opt/keycloak/themes/webprotege.v2