#!/bin/sh
if [ "$SERVICE_TYPE" = "worker" ]; then
  exec celery -A workers.celery_app worker --loglevel=info --concurrency=10
else
  exec uvicorn main:app --host 0.0.0.0 --port "$PORT"
fi
