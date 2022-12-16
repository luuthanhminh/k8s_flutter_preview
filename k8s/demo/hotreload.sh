#!/bin/bash

while true
do
    find /app/lib/ -name '*.dart' | entr -dnp /scripts/hotreloader.sh /_
done