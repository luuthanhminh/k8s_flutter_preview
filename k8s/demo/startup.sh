#!/bin/bash

tmux new -d -s webSession

tmux pipe-pane -o -t webSession 'cat >> /tmp/tmuxpipe'

tmux send-keys -t webSession.0 "(cd /app && /usr/local/flutter/bin/flutter build web &&  /usr/local/flutter/bin/flutter run --web-port 5000 -d web-server --web-hostname 0.0.0.0)" ENTER

tmux new -d -s webReloader

tmux send-keys -t webReloader.0 "sh /scripts/hotreload.sh" ENTER