#!/bin/sh
# Start the product.  ./run.sh   then open http://localhost:4173
#
# Reads .env if it exists. Node loads it natively, so there is no dotenv
# dependency and no import order to get wrong.
set -e
cd "$(dirname "$0")"
[ -d node_modules ] || npm install
if [ -f .env ]; then
  exec node --env-file=.env server/index.js
else
  echo "  No .env, so the voice transport and the model will resolve to simulated."
  echo "  Copy .env.example to .env to change that."
  exec node server/index.js
fi
