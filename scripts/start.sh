#!/bin/sh

if [ ! -d "./node_modules" ]; then
    printf '\n⚙️  start.sh: installing node modules\n'
    npm install
fi

if [ ! -d "./build" ]; then
    printf '\n⚙️  start.sh: building typescript\n'
    npm run build
fi

printf "\n⚙️  start.sh: starting server, env: $NODE_ENV\n"
npm run serve