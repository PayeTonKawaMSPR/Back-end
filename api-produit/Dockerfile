# Utilise une image Node légère
FROM node:18-alpine

# Définit le dossier de travail
WORKDIR /app

# Copie les fichiers de dépendances (meilleure utilisation du cache Docker)
COPY package*.json ./

# Installe les dépendances de ton projet
RUN npm install

# Installe nodemon globalement (nécessaire pour npm run dev)
RUN npm install -g nodemon

# Copie tout le reste du projet dans l'image
COPY . .

# Définit la commande par défaut
CMD ["npm", "run", "dev"]
