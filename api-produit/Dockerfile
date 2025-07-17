# Utilise une image Node légère
FROM node:18-alpine

# Définit le dossier de travail
WORKDIR /app

# Copie les fichiers de dépendances
COPY package*.json ./

# Installe les dépendances
RUN npm install

# Installe nodemon globalement
RUN npm install -g nodemon

# Copie tout le reste
COPY . .

# Commande de démarrage : seed automatique puis démarrage du serveur
CMD npm run seed && npm run dev
