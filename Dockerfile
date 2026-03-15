FROM nginx:alpine

# Remove default page and add ours
RUN rm -rf /usr/share/nginx/html/*
COPY index.html /usr/share/nginx/html/index.html

# Nginx config with gzip + caching
COPY default.conf /etc/nginx/conf.d/default.conf

RUN chmod 644 /usr/share/nginx/html/index.html

EXPOSE 80

