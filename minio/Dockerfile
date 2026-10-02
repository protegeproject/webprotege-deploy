# MinIO's Community Edition is now source-only distributed — Docker Hub no
# longer carries minio/minio images, and dl.min.io's pre-built binaries
# return 410 Gone. Build the pinned release from source instead.
# See: https://github.com/minio/minio/blob/master/README.md#source-only-distribution
ARG MINIO_RELEASE=RELEASE.2024-05-10T01-41-38Z

FROM golang:1.21-alpine AS build
ARG MINIO_RELEASE
RUN apk add --no-cache git
ENV CGO_ENABLED=0
RUN go install github.com/minio/minio@${MINIO_RELEASE}

FROM alpine:3.19
RUN apk add --no-cache ca-certificates
COPY --from=build /go/bin/minio /usr/bin/minio
VOLUME ["/data"]
ENTRYPOINT ["/usr/bin/minio"]
CMD ["server", "/data", "--console-address", ":9001"]
