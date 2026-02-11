#!/bin/bash

# Elasticsearch ILM Policy and Index Template Initialization Script
# This script sets up Index Lifecycle Management for log archiving

set -e

ELASTICSEARCH_HOST="${ELASTICSEARCH_HOST:-http://elasticsearch:9200}"
MAX_RETRIES=30
RETRY_INTERVAL=5

echo "Waiting for Elasticsearch to be ready..."

# Wait for Elasticsearch to be available
for i in $(seq 1 $MAX_RETRIES); do
  if curl -f -s "$ELASTICSEARCH_HOST" > /dev/null 2>&1; then
    echo "Elasticsearch is ready!"
    break
  fi
  if [ $i -eq $MAX_RETRIES ]; then
    echo "Elasticsearch failed to start after $MAX_RETRIES attempts"
    exit 1
  fi
  echo "Waiting for Elasticsearch... ($i/$MAX_RETRIES)"
  sleep $RETRY_INTERVAL
done

# Create ILM Policy
echo "Creating ILM policy: webprotege-logs-policy"
ILM_RESPONSE=$(curl -X PUT "$ELASTICSEARCH_HOST/_ilm/policy/webprotege-logs-policy" \
  -H 'Content-Type: application/json' \
  -d @/init/ilm-policy.json \
  -w "\n" -s 2>&1)
if echo "$ILM_RESPONSE" | grep -q '"acknowledged":true'; then
  echo "  ✓ ILM policy created successfully"
elif echo "$ILM_RESPONSE" | grep -q "resource_already_exists_exception"; then
  echo "  ℹ ILM policy already exists, updating..."
  curl -X PUT "$ELASTICSEARCH_HOST/_ilm/policy/webprotege-logs-policy" \
    -H 'Content-Type: application/json' \
    -d @/init/ilm-policy.json \
    -w "\n" -s | grep -q '"acknowledged":true' && echo "  ✓ ILM policy updated successfully" || echo "  ✗ Failed to update ILM policy"
else
  echo "  ✗ Failed to create ILM policy: $ILM_RESPONSE"
fi

# Create Index Template
echo "Creating index template: webprotege-logs-template"
TEMPLATE_RESPONSE=$(curl -X PUT "$ELASTICSEARCH_HOST/_index_template/webprotege-logs-template" \
  -H 'Content-Type: application/json' \
  -d @/init/index-template.json \
  -w "\n" -s 2>&1)
if echo "$TEMPLATE_RESPONSE" | grep -q '"acknowledged":true'; then
  echo "  ✓ Index template created successfully"
elif echo "$TEMPLATE_RESPONSE" | grep -q "resource_already_exists_exception"; then
  echo "  ℹ Index template already exists, updating..."
  curl -X PUT "$ELASTICSEARCH_HOST/_index_template/webprotege-logs-template" \
    -H 'Content-Type: application/json' \
    -d @/init/index-template.json \
    -w "\n" -s | grep -q '"acknowledged":true' && echo "  ✓ Index template updated successfully" || echo "  ✗ Failed to update index template"
else
  echo "  ✗ Failed to create index template: $TEMPLATE_RESPONSE"
fi

# Check if indices exist and apply ILM policy to existing indices (if any)
echo "Checking for existing indices..."
INDICES_JSON=$(curl -s "$ELASTICSEARCH_HOST/_cat/indices/webprotege-logs-*?format=json&h=index" 2>/dev/null || echo "[]")

# Check if we have any indices
if [ "$INDICES_JSON" != "[]" ] && [ -n "$INDICES_JSON" ]; then
  echo "Found existing indices. Applying ILM policy..."
  
  # Get list of index names (handle both JSON array format and simple list)
  if echo "$INDICES_JSON" | grep -q '"index"'; then
    INDEX_NAMES=$(echo "$INDICES_JSON" | grep -o '"index":"[^"]*"' | cut -d'"' -f4 | sort -u)
  else
    INDEX_NAMES=$(echo "$INDICES_JSON" | grep -v "^\[" | grep -v "^\]" | tr -d '",' | grep -v "^$" | sort -u)
  fi
  
  if [ -n "$INDEX_NAMES" ]; then
    APPLIED_COUNT=0
    FAILED_COUNT=0
    
    # Apply ILM policy to each existing index
    for INDEX_NAME in $INDEX_NAMES; do
      if [ -z "$INDEX_NAME" ] || [ "$INDEX_NAME" = "index" ]; then
        continue
      fi
      
      echo -n "  Applying ILM policy to index: $INDEX_NAME ... "
      # Attach the ILM policy to the index settings
      SETTINGS_RESPONSE=$(curl -X PUT "$ELASTICSEARCH_HOST/$INDEX_NAME/_settings" \
        -H 'Content-Type: application/json' \
        -d "{\"index\":{\"lifecycle\":{\"name\":\"webprotege-logs-policy\"}}}" \
        -w "\n" -s 2>&1)
      
      if echo "$SETTINGS_RESPONSE" | grep -q '"acknowledged":true'; then
        echo "✓"
        APPLIED_COUNT=$((APPLIED_COUNT + 1))
      else
        echo "✗"
        FAILED_COUNT=$((FAILED_COUNT + 1))
      fi
    done
    
    echo ""
    echo "  Summary: Applied to $APPLIED_COUNT indices, Failed: $FAILED_COUNT indices"
    
    # Retry ILM execution for all indices to trigger immediate processing
    if [ $APPLIED_COUNT -gt 0 ]; then
      echo "Retrying ILM execution for all indices..."
      RETRY_RESPONSE=$(curl -X POST "$ELASTICSEARCH_HOST/webprotege-logs-*/_ilm/retry" \
        -w "\n" -s 2>&1)
      if echo "$RETRY_RESPONSE" | grep -q '"acknowledged":true'; then
        echo "  ✓ ILM retry executed successfully"
      else
        echo "  ℹ ILM retry completed (some indices may already be processed)"
      fi
    fi
  fi
else
  echo "No existing indices found. New indices will automatically use the ILM policy."
fi

echo ""
echo "ILM initialization completed successfully!"
echo "Policy: webprotege-logs-policy"
echo "Template: webprotege-logs-template"
echo "Lifecycle: Hot (0-7d) -> Warm (7-30d) -> Cold (30-90d) -> Delete (90d+)"