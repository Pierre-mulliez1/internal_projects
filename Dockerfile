# Utilisation de l'image Nginx stable basée sur Alpine (très légère)
FROM nginx:alpine

# Suppression des fichiers par défaut de Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copie du fichier index.html vers le dossier public de Nginx
COPY index.html /usr/share/nginx/html/

# Copie du dossier Pictures vers le dossier public de Nginx
# La commande copie le dossier lui-même dans la destination
COPY Pictures /usr/share/nginx/html/Pictures

# Expose le port 80 pour le trafic web
EXPOSE 80

# Nginx démarre automatiquement avec l'image, pas besoin de CMD spécifique