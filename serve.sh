#!/bin/sh
echo "→ Starte Server auf http://localhost:8082"
python3 -m http.server 8082 --directory "$(dirname "$0")"
