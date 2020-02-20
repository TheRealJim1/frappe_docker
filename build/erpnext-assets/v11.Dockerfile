FROM bitnami/node:10-prod

WORKDIR /home/frappe/frappe-bench
RUN mkdir -p /home/frappe/frappe-bench/sites \
    && echo -e "frappe\nerpnext" > /home/frappe/frappe-bench/sites/apps.txt

RUN install_packages git

RUN mkdir -p apps sites/assets  \
    && cd apps \
    && git clone --depth 1 https://github.com/frappe/frappe --branch version-11 \
    && git clone --depth 1 https://github.com/frappe/erpnext --branch version-11

RUN cd /home/frappe/frappe-bench/apps/frappe \
    && yarn \
    && yarn run production \
    && rm -fr node_modules \
    && yarn install --production=true

RUN git clone --depth 1 https://github.com/frappe/bench /tmp/bench \
    && mkdir -p /var/www/error_pages \
    && cp -r /tmp/bench/bench/config/templates/502.html /var/www/error_pages

RUN cp -R /home/frappe/frappe-bench/apps/frappe/frappe/public/* /home/frappe/frappe-bench/sites/assets/frappe \
    && cp -R /home/frappe/frappe-bench/apps/frappe/node_modules /home/frappe/frappe-bench/sites/assets/frappe/ \
    && cp -R /home/frappe/frappe-bench/apps/erpnext/erpnext/public/* /home/frappe/frappe-bench/sites/assets/erpnext \
    && mkdir -p /home/frappe/frappe-bench/sites/assets/erpnext \
    && cp -r /tmp/bench/bench/config/templates /var/www/error_pages

FROM nginx:latest
COPY --from=0 /home/frappe/frappe-bench/sites /var/www/html/
COPY --from=0 /var/www/error_pages /var/www/
COPY build/common/nginx-default.conf.template /etc/nginx/conf.d/default.conf.template
COPY build/erpnext-assets/docker-entrypoint.sh /

RUN apt-get update && apt-get install -y rsync && apt-get clean

VOLUME [ "/assets" ]

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
