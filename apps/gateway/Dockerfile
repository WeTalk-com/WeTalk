FROM nginx:1.27-alpine

# Supprime la config par défaut
RUN rm /etc/nginx/conf.d/default.conf

# Copie notre config
COPY apps/gateway/proxy_params.conf /etc/nginx/proxy_params.conf
COPY apps/gateway/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
EXPOSE 443
