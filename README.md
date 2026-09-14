📋 Instructions pour exécuter l'application vous-même

Pour tester toutes les fonctionnalités que nous avons implémentées, suivez ces
étapes :

1. Backend (Java/Spring Boot)

# Aller dans le répertoire backend

cd marketplace/backend

# Construire l'application (cela exécutera également les migrations Flyway)

mvn clean install

# Démarrer le serveur

mvn spring-boot:run

Le backend sera accessible sur : http://localhost:8080

- API : http://localhost:8080/api/v1
- Swagger UI : http://localhost:8080/swagger-ui.html
- Actuator : http://localhost:8080/actuator/health

2. Frontend (React/Vite)

# Dans un nouveau terminal, aller dans le répertoire frontend

cd marketplace/frontend

# Installer les dépendances

npm install

# Démarrer le serveur de développement

npm run dev

Le frontend sera accessible sur : http://localhost:5173

3. Comptes de démonstration disponibles (après migration V2)

┌──────────┬────────────────┬──────────────┐
│ Rôle │ Email │ Mot de passe │
├──────────┼────────────────┼──────────────┤
│ Admin │ admin@demo.fr │ Admin12345! │
├──────────┼────────────────┼──────────────┤
│ Vendeur │ seller@demo.fr │ Seller12345! │
├──────────┼────────────────┼──────────────┤
│ Acheteur │ buyer@demo.fr │ Buyer12345! │
└──────────┴────────────────┴──────────────┘

# Se connecter à PostgreSQL en tant qu'utilisateur postgres

sudo -u postgres psql

# Dans le shell psql, exécuter ces commandes :

CREATE DATABASE marketplace;
CREATE USER marketplace WITH PASSWORD 'marketplace';
GRANT ALL PRIVILEGES ON DATABASE marketplace TO marketplace;
\q # Pour quitter psql
