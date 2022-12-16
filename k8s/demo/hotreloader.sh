#!/bin/bash

set -euo pipefail 
if [[ "${1-}" != "" ]]; then 
    echo $1 
    if [[ "$1" =~ \/state\/ || "$1" =~ backend ]]; then 
        echo "Restarting" 
        tmux send-keys -t webSession.0 R 
    else 
        echo "Reloading" 
        tmux send-keys -t webSession.0 R 
    fi 
fi