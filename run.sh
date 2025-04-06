#!/bin/bash

#Empty array to store process IDs.
PIDS=()

#Cleanup function defined
cleanup() {
    #Examines all of the process IDs in the array.
    for PID in "${PIDS[@]}"; do
        kill "$PID"
    done
    #Wait for processes to finish
    wait
}

#Trap to cleanup when script ends.
trap cleanup EXIT

#Clinic360 directory investigation when push begins.
pushd clinic360 && ./run.sh &
PIDS+=($!)

#Push for the -fe directory with the npm dev command running alongside.
pushd clinic360-fe && npm run dev &
PIDS+=($!)

#Wait for all processes before exiting.
wait
