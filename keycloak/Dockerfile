FROM keycloak/keycloak:26.1

USER root
RUN microdnf install -y curl && microdnf clean all
USER keycloak

EXPOSE 8080

COPY ./webprotege.v2 /opt/keycloak/themes/webprotege.v2