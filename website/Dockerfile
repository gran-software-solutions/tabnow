# The TabNow landing page: Astro's built dist/, served by nginx.
#
# No build step in here: the deploy runs `npm run build` (source checks, Astro,
# dist checks) before this image is built, so what lands in /usr/share/nginx/html is the output the
# checks passed. .dockerignore admits only dist/ and nginx.conf.
FROM nginx:alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY dist/ /usr/share/nginx/html/

# nginx runs as uid 101 and COPY keeps the checkout's modes; a 0600 file would serve 403.
RUN chmod -R a+rX /usr/share/nginx/html

EXPOSE 80
