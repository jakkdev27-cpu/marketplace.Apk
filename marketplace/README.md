# Marketplace — Plateforme e-commerce multivendeur

Base de code professionnelle, **100 % indépendante de tout outil de génération**, prête à être
exécutée localement avec Docker puis déployée manuellement.

> **Périmètre de ce livrable : Phase 0 (socle) + socle Phase 1.**
> Le live shopping (Phase 2), les commissions, la livraison avec carte, les notifications et le
> paiement en ligne sont **préparés architecturalement** (entités, statuts, commentaires `TODO`)
> mais non implémentés — voir la section « Feuille de route ».

---

## 1. Fonctionnalités livrées

| Module | Inclus |
|---|---|
| Authentification | Inscription (acheteur/vendeur), connexion, JWT access (15 min) + refresh token **rotatif et révocable**, logout, consentements légaux obligatoires à l'inscription (jamais précochés, versionnés, IP + User-Agent) |
| Rôles & sécurité | `BUYER`, `SELLER`, `ADMIN` — Spring Security, RBAC, **isolation stricte des vendeurs**, mots de passe BCrypt, CORS configurable, erreurs JSON au format unique |
| Catalogue | Catégories (admin : CRUD + désactivation douce), produits multivendeur (prix en **unités mineures entières**, devise XOF, promo via ancien prix, images, référence, statut, verrou optimiste `@Version`), recherche (ILIKE, full-text PostgreSQL prévu), filtres, tri, pagination plafonnée |
| Boutiques | Profil boutique par vendeur (nom, slogan, description, coordonnées, visuels), slug unique, page publique |
| Panier | Multivendeur, quantités bornées par le stock réel, fusion des lignes |
| Commandes | Checkout **transactionnel** : commande globale → `SellerOrder` par vendeur → lignes, **décrément de stock sous verrou pessimiste** (pas de survente), statuts + **historique complet** des changements, snapshot du nom/prix produit, champ `live_session_id` prêt pour la Phase 2 |
| Paiement | **Non implémenté** (paiement physique) — entité `Payment` + statuts + abstraction préparés, commentaires `TODO PAYMENT` / `TODO PAYMENT WEBHOOK` |
| Documents légaux | Entités `LegalDocument` (versionnement, DRAFT/PUBLISHED/ARCHIVED, toutes versions conservées) et `LegalConsent`, pages publiques, API admin (brouillon → publication → archivage), 6 documents v1 fournis en **brouillon** |
| Audit | `AuditLog` : inscription, connexion, commandes, changements de statut, gestion boutique |
| Qualité | Flyway (migrations V1 schéma + V2 données démo), tests unitaires, gestion centralisée des exceptions, Bean Validation, pagination/tri normalisés |

## 2. Stack technique

- **Backend** : Java 21 (LTS), Spring Boot 3.3, Spring Security + JWT, Spring Data JPA/Hibernate, Bean Validation, Flyway, springdoc-openapi (Swagger)
- **Frontend** : React 18, Vite, TypeScript **strict**, Tailwind CSS + DaisyUI, React Router, TanStack Query, Axios
- **Base de données** : PostgreSQL 16
- **DevOps** : Docker, Docker Compose, Git
- **API** : REST sous `/api/v1`, erreurs au format unique `{timestamp, status, error, code, message, path}`

## 3. Démarrage rapide (Docker)

Prérequis : Docker + Docker Compose.

```bash
cp .env.example .env   # adapter si besoin (JWT_SECRET ≥ 32 caractères)
docker compose up --build
```

Puis :

| Service | URL |
|---|---|
| Application (frontend) | http://localhost:8081 |
| API | http://localhost:8080/api/v1 |
| Swagger UI | http://localhost:8080/swagger-ui.html |
| Santé | http://localhost:8080/actuator/health |
| PostgreSQL | localhost:5432 (`marketplace` / `marketplace`) |

### Comptes de démonstration (migration V2)

| Rôle | Email | Mot de passe |
|---|---|---|
| Admin | `admin@demo.fr` | `Admin12345!` |
| Vendeur | `seller@demo.fr` | `Seller12345!` |
| Acheteur | `buyer@demo.fr` | `Buyer12345!` |

> ⚠️ **Supprimer la migration V2 (ou son contenu) avant toute mise en production.**

## 4. Développement local sans Docker

```bash
# 1. PostgreSQL 16 local + base "marketplace" (utilisateur/mot de passe : marketplace)
# 2. Backend (Java 21 + Maven)
cd backend
mvn spring-boot:run

# 3. Frontend (Node 20+)
cd frontend
npm install
npm run dev          # http://localhost:5173 (proxy /api -> :8080)
```

## 5. Configuration

Toute la configuration passe par des **variables d'environnement** (voir `.env.example`).
Aucun secret dans le code. Le backend lit :

- `DATABASE_URL`, `DATABASE_USERNAME`, `DATABASE_PASSWORD`
- `JWT_SECRET` (**≥ 32 caractères**), `JWT_ACCESS_TTL_MINUTES`, `JWT_REFRESH_TTL_DAYS`
- `CORS_ALLOWED_ORIGINS`, `FRONTEND_URL`
- `PAYMENT_PROVIDER`, `PAYMENT_API_KEY` (réservés — paiement non implémenté)
- `STORAGE_PROVIDER`, `CLOUDINARY_URL` (réservés — stockage d'images à brancher)
- `LEGAL_*` (mentions légales)

## 6. Architecture

```
marketplace/
├── backend/                        # Spring Boot 3 — Java 21
│   └── src/main/java/com/marketplace/
│       ├── auth/                   # inscription, login, refresh, logout
│       ├── audit/                  # AuditService
│       ├── cart/                   # panier multivendeur
│       ├── catalog/                # produits, catégories
│       ├── config/                 # AppProperties
│       ├── entity/                 # User, Shop, Product, PurchaseOrder, SellerOrder,
│       │                           # LegalDocument, LegalConsent, Payment, AuditLog...
│       ├── exception/              # ApiException + gestionnaire centralisé
│       ├── legal/                  # documents + consentements
│       ├── order/                  # checkout transactionnel, statuts, historique
│       ├── repository/             # Spring Data JPA
│       ├── security/               # JWT, filtres, SecurityConfig, RBAC
│       ├── shop/                   # boutiques vendeurs
│       └── util/                   # SlugUtils, Hashes
│   └── src/main/resources/db/migration/   # Flyway V1 (schéma) + V2 (démo)
├── frontend/                       # React 18 + Vite + TS strict
│   └── src/
│       ├── api/                    # client Axios (intercepteurs)
│       ├── auth/                   # AuthContext
│       ├── components/             # Layout, ProductCard, RequireAuth
│       ├── pages/                  # Home, Products, ProductDetail, Cart, Orders,
│       │                           # Login, Register, SellerDashboard, Legal...
│       └── utils/                  # formatPrice (unités mineures)
├── docker-compose.yml              # PostgreSQL 16 + backend + frontend
└── .env.example
```

### Décisions structurantes

- **Montants en unités mineures entières** (`BIGINT`, ex. 25 000 FCFA = `2_500_000`), devise en
  champ séparé — aucun `float/double` monétaire, aucune erreur d'arrondi.
- **Isolation vendeur non négociable** : tout accès vendeur passe par `findBySellerId` / contrôle
  `shop.seller.id == currentUser.id` côté service (jamais seulement côté contrôleur).
- **Stock concurrent** : verrou pessimiste `PESSIMISTIC_WRITE` au checkout + verrou optimiste
  `@Version` sur `Product` → **pas de survente**, y compris lors d'achats simultanés.
- **Suppressions douces** : produits (ARCHIVED), catégories (désactivation) — les données
  commerciales ne sont jamais effacées en dur.
- **Historique des statuts** : chaque transition (commande globale ou sous-commande vendeur) est
  tracée avec ancien/nouveau statut + auteur.

## 7. API (extrait)

Toutes les routes sont sous `/api/v1`. Swagger UI : `/swagger-ui.html` (désactiver en production).

| Méthode & route | Accès | Description |
|---|---|---|
| `POST /auth/register` | public | Inscription + consentements obligatoires |
| `POST /auth/login` | public | Connexion → access + refresh |
| `POST /auth/refresh` | public | Rotation du refresh token |
| `POST /auth/logout` | public | Révocation du refresh token |
| `GET /products` | public | Pagination (`page`, `size` ≤ 50), `q`, `categoryId`, `sort` |
| `GET /products/{id}` | public | Détail |
| `POST/PUT/DELETE /products[/{id}]` | SELLER/ADMIN | Gestion (propriétaire uniquement) |
| `GET /seller/products` | SELLER | Mes produits (tous statuts) |
| `GET/PUT /seller/shop` | SELLER | Ma boutique (création ou mise à jour) |
| `GET /shops/{slug}` | public | Boutique publique |
| `GET /categories` | public | Catégories actives |
| `POST/PUT/DELETE /admin/categories[/{id}]` | ADMIN | Gestion des catégories |
| `GET/POST /cart`… | BUYER+ | Panier |
| `POST /orders/checkout` | authentifié | Panier → commande multivendeur |
| `GET /orders[/{id}]` | authentifié | Mes commandes |
| `GET /seller-orders` | SELLER | Mes sous-commandes |
| `PATCH /seller-orders/{id}/status` | SELLER/ADMIN | Changement de statut + historique |
| `GET /legal/published[/{type}]` | public | Documents légaux publiés |
| `GET/POST /admin/legal…` | ADMIN | Brouillon, publication, archivage |

## 8. Sécurité

- RBAC par annotations de routes + **contrôles de propriété systématiques en couche service**
- JWT HS256 signé, claims `uid` + `role` ; refresh token opaque, stocké **hashé (SHA-256)**,
  à rotation et révocation
- Mots de passe BCrypt (coût 10) ; messages d'erreur uniques pour ne pas révéler l'existence d'un compte
- Validation de toutes les entrées (Bean Validation), format d'erreur unique, CORS restrictif
- Audit des opérations sensibles (IP conservée)
- **À ajouter avant production** : rate limiting (login/inscription/réinitialisation),
  headers de sécurité renforcés, HTTPS forcé, politique de mots de passe, sauvegardes chiffrées

## 9. ⚖️ Avertissement juridique (à conserver)

> **L'IA ne certifie aucune conformité juridique automatique.** Les textes des documents légaux
> fournis (politique de confidentialité, CGU, CGV, cookies, remboursement, vendeurs) sont des
> **brouillons** générés automatiquement. Ils doivent être adaptés au pays d'exploitation, aux
> données réellement traitées, et validés par un professionnel du droit si nécessaire. La collecte
> d'adresse IP/User-Agent dans les consentements doit être justifiée légalement.

## 10. Feuille de route (hors périmètre de ce socle)

Les points d'extension sont déjà en place :

- **Commissions** : `TODO COMMISSION` dans `OrderService` — créer l'entité `Commission` au moment
  du checkout selon un taux configurable par vendeur/catégorie.
- **Paiement** : brancher un `PaymentProvider` (TMoney, Flooz, carte, PayPal) derrière l'entité
  `Payment` — les statuts `PAYMENT_*` sont définis. Ne jamais simuler de transaction réelle.
- **Livraison** : entités `Delivery`, `DeliveryZone`, `DeliveryFee` + carte Leaflet/OSM (région Maritime).
- **Live shopping (Phase 2)** : module `live/` séparé, WebSocket (STOMP), `LiveSession`…,
  le champ `orders.live_session_id` est déjà prêt. **Le streaming vidéo à grande échelle ne doit
  pas transiter par le backend Spring Boot** : prévoir un fournisseur spécialisé derrière
  l'abstraction `LiveStreamingProvider`.
- **Réseau social produit** : commentaires, réactions, avis, favoris.
- **Notifications** : entité `Notification` + abstraction multi-canaux (interne, email, push, SMS).
- **i18n** : structure de clés côté frontend et messages côté backend, français par défaut.
- **Recherche** : bascule possible vers Meilisearch/Elasticsearch derrière l'abstraction existante.

## 11. Tests

```bash
cd backend && mvn test
```

Couvert actuel : `JwtServiceTest` (génération/parsage JWT), `SlugUtilsTest`.
Critères d'acceptation à couvrir ensuite par des tests d'intégration (Testcontainers) :
isolation vendeur A/B sur chaque endpoint, calcul de commission exact, panier multivendeur,
stock concurrent, annulation et effets en cascade, consentements (non-précoché, versionnement),
commandes Live avec `liveSessionId` correct.

## 12. Déploiement (manuel — l'IA ne déploie jamais)

Piste « coût 0 » de départ (sous réserve des offres à la date du déploiement) :
GitHub (code) · Vercel/Netlify (frontend) · Render/Koyeb (backend JAR) · Neon/Supabase (PostgreSQL)
· Cloudinary (images). Le projet migre vers une infrastructure payante sans réécriture.

Checklist production : supprimer la V2 seed, définir `JWT_SECRET` fort, désactiver Swagger,
activer HTTPS + sauvegardes, faire valider les documents légaux, configurer les emails.
