FROM node:10.15.1-jessie

WORKDIR /usr/src/acms

COPY ./src ./src
COPY ./scripts ./scripts
COPY ./package.json .
COPY ./tsconfig.json .

RUN chmod +x ./scripts/start.sh
CMD ./scripts/start.sh
