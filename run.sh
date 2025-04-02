#!/bin/bash

PIDS=()

#Cleanup function defined
cleanup() {
    for PID in "${PIDS[@]}"; do
        kill "$PID"
    done
    wait
}

trap cleanup EXIT

pushd clinic360 && ./run.sh &
PIDS+=($!)

pushd clinic360-fe && npm run dev &
PIDS+=($!)

wait
