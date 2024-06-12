FROM minio/minio

# Set the environment variables
ENV MINIO_ROOT_USER=webprotege
ENV MINIO_ROOT_PASSWORD=webprotege
ENV CONSOLE_ADDRESS=9000

# Expose the necessary ports
EXPOSE 9000 9001

# Run the Minio server with the specified command
CMD ["server", "/data"]