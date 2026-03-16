#!/bin/sh

LANGUAGE=python
LANGUAGE_VERSION=3.12.0

# Sleep some time, could be replaced with healthcheck on piston_service
sleep 5

echo "Installing language package..."

RESPONSE=$(curl -fs -X POST http://piston_service:2000/api/v2/packages \
  -H "Content-Type: application/json" \
  -d "{
        \"language\": \"${LANGUAGE}\",
        \"version\": \"${LANGUAGE_VERSION}\"
      }")
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
  echo "Language package installed!"
  exit 0
else
  echo "An error occurred! Exit code: $EXIT_CODE"
  echo "Response: $RESPONSE"
  exit $EXIT_CODE
fi
