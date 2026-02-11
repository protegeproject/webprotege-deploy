## ELK Stack Configuration

The deployment includes an ELK (Elasticsearch, Logstash, Kibana) stack for centralized logging with automatic log archiving and cleanup.

### Components

- **Elasticsearch**: Stores log indices with Index Lifecycle Management (ILM) for automatic archiving
- **Logstash**: Processes and forwards logs from Filebeat to Elasticsearch
- **Filebeat**: Collects logs from Docker containers
- **Kibana**: Web interface for log visualization and analysis
- **elasticsearch-init**: Initialization container that sets up ILM policies and index templates

### Automatic Log Archiving

The ELK stack is configured with Index Lifecycle Management (ILM) to automatically manage log retention:

- **Hot Phase (0-7 days)**: Active indices with high priority for fast access
- **Warm Phase (7-30 days)**: Read-only indices with reduced replicas and optimized storage
- **Cold Phase (30-90 days)**: Archived indices with lowest priority
- **Delete Phase (90+ days)**: Automatic deletion to prevent disk space issues

**Important**: Logs older than 90 days are automatically deleted. This prevents disk space from growing indefinitely.

### Initialization

The `elasticsearch-init` container automatically:
1. Waits for Elasticsearch to be ready
2. Creates/updates the ILM policy (`webprotege-logs-policy`)
3. Creates/updates the index template (`webprotege-logs-template`)
4. Applies the ILM policy to any existing indices

### Verification

To verify the ILM configuration is working correctly:

```bash
# Check ILM status (should show "RUNNING")
curl http://localhost:9200/_ilm/status

# Check if ILM policy exists
curl http://localhost:9200/_ilm/policy/webprotege-logs-policy

# Check index lifecycle status
curl http://localhost:9200/webprotege-logs-*/_ilm/explain | jq

# List indices with their lifecycle status
curl http://localhost:9200/_cat/indices/webprotege-logs-*?v&h=index,creation.date.string,ilm.managed,ilm.policy
```

### Manual Policy Application

If you have existing indices that need the ILM policy applied:

```bash
# Run inside the init container (if still running)
docker exec -it <elasticsearch-init-container> sh /init/init-ilm.sh

# Or manually attach policy to specific indices
curl -X PUT "http://localhost:9200/webprotege-logs-YYYY.MM.DD/_settings" \
  -H 'Content-Type: application/json' \
  -d '{"index":{"lifecycle":{"name":"webprotege-logs-policy"}}}'
```

### Customization

To modify retention periods, edit `elasticsearch/init/ilm-policy.json`:
- Change `"min_age": "7d"` in warm phase to adjust when indices move to warm
- Change `"min_age": "30d"` in cold phase to adjust when indices move to cold
- Change `"min_age": "90d"` in delete phase to adjust retention period

After changes, restart the `elasticsearch-init` container or manually update the policy.

For detailed ILM configuration documentation, see [elasticsearch/init/README.md](elasticsearch/init/README.md).

### Docker Logs Configuration

All services are configured with Docker logging limits:
- `max-size: "10m"` - Maximum 10MB per log file
- `max-file: "3"` - Maximum 3 log files per service
- Total maximum per service: ~30MB

This prevents Docker logs from consuming excessive disk space.