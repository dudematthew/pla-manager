FROM <base-image>

RUN apt-get update && apt-get install -y curl gnupg2
RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add -
RUN echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list
RUN apt-get update && apt-get install -y yarn && apt-mark hold yarn

COPY . /app
WORKDIR /app

RUN yarn install

CMD ["npm", "start"]