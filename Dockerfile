# First stage: build front app
FROM node:8.12 AS node


WORKDIR /code

COPY ./frontend /code/
ENV NODE_PATH /code/src
RUN yarn
RUN yarn build


# Second stage: build base backend
FROM python:3.7


RUN apt-get update && apt-get install -y \
  bash \
  vim \
  curl \
  openssh-server \
  openssh-client

ADD ./.profile.d /app/.profile.d
RUN chmod a+x /app/.profile.d/heroku-exec.sh
RUN rm /bin/sh && ln -s /bin/bash /bin/sh

ADD ./sh-wrapper.sh /bin/sh-wrapper.sh
RUN chmod a+x /bin/sh-wrapper.sh
RUN rm /bin/sh && ln -s /bin/sh-wrapper.sh /bin/sh


ENV DJANGO_SETTINGS_MODULE root.settings.prod
ENV PYTHONPATH /code
ENV CELERY_BROKER_URL sqs://

WORKDIR /code

RUN pip install pipenv gunicorn

COPY ./backend /code/
COPY --from=node /code/build /code/front/static/front

RUN pipenv install --system --deploy

# Collect statics
RUN mkdir -p /var/log/falco
RUN touch /var/log/falco/django.log
RUN SECRET_KEY=itdoesntreallymatter LOG_PATH=/var/log/falco/django.log python ./manage.py collectstatic
