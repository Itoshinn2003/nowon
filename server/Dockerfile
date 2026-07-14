ARG RUBY_VERSION=3.4.1
FROM ruby:$RUBY_VERSION

WORKDIR /server

RUN apt-get update -qq && \
    apt-get install --no-install-recommends -y \
      build-essential \
      git \
      libpq-dev \
      libvips \
      libyaml-dev \
      postgresql-client \
      pkg-config && \
    rm -rf /var/lib/apt/lists /var/cache/apt/archives

COPY Gemfile Gemfile.lock ./
RUN bundle install

COPY . .

EXPOSE 3000

CMD ["bash", "-lc", "rm -f tmp/pids/server.pid && bin/rails server -b 0.0.0.0"]
