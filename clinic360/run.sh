#!/bin/bash

PIDS=()

cleanup() {
    for PID in "${PIDS[@]}"; do
        kill "$PID"
    done
    wait
}

trap cleanup EXIT

python manage.py migrate
celery -A clinic360 worker --loglevel=info &
PIDS+=($!)
celery -A clinic360 beat --loglevel=info &
PIDS+=($!)
python manage.py runserver &
PIDS+=($!)