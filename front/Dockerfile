FROM node:15

ENV APP_ROOT /app

RUN mkdir %{APP_ROOT}
WORKDIR ${APP_ROOT}
ADD . ${APP_ROOT}

# install dependencies
RUN yarn install

ENV HOST 0.0.0.0
