# Image nginx légère
FROM nginx:alpine

# Nettoyer le dossier par défaut
RUN rm -rf /usr/share/nginx/html/*

# Copier uniquement le build Angular (browser)
COPY dist/tracking-front/browser /usr/share/nginx/html

# Copier la config nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Entrypoint qui génère env.js au démarrage du conteneur
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh

EXPOSE 80

CMD ["/docker-entrypoint.sh"]
