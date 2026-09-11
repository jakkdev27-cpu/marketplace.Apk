CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- Phase 0 — Socle : schéma initial
-- Toutes les colonnes monétaires sont en unités mineures (BIGINT).
-- ============================================================

CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name    VARCHAR(100) NOT NULL,
    last_name     VARCHAR(100) NOT NULL,
    role          VARCHAR(20)  NOT NULL DEFAULT 'BUYER',
    created_at    TIMESTAMPTZ  NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ  NOT NULL DEFAULT now()
);

CREATE TABLE refresh_tokens (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_refresh_tokens_user ON refresh_tokens(user_id);

CREATE TABLE shops (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id   UUID NOT NULL UNIQUE REFERENCES users(id),
    name        VARCHAR(150) NOT NULL,
    slug        VARCHAR(180) NOT NULL UNIQUE,
    description TEXT,
    slogan      VARCHAR(255),
    logo_url    VARCHAR(500),
    banner_url  VARCHAR(500),
    phone       VARCHAR(30),
    email       VARCHAR(255),
    address     VARCHAR(500),
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE categories (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        VARCHAR(120) NOT NULL,
    slug        VARCHAR(140) NOT NULL UNIQUE,
    description TEXT,
    image_url   VARCHAR(500),
    active      BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE products (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id             UUID NOT NULL REFERENCES shops(id),
    category_id         UUID REFERENCES categories(id),
    name                VARCHAR(200) NOT NULL,
    description         TEXT,
    price_minor         BIGINT NOT NULL CHECK (price_minor >= 0),
    old_price_minor     BIGINT,
    currency            VARCHAR(8) NOT NULL DEFAULT 'XOF',
    stock               INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    low_stock_threshold INT NOT NULL DEFAULT 5,
    reference           VARCHAR(100),
    images              TEXT NOT NULL DEFAULT '[]',
    status              VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    version             BIGINT NOT NULL DEFAULT 0,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_shop ON products(shop_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_status ON products(status);

CREATE TABLE carts (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id   UUID NOT NULL UNIQUE REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE cart_items (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cart_id    UUID NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity   INT NOT NULL CHECK (quantity > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (cart_id, product_id)
);

CREATE TABLE orders (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id   UUID NOT NULL REFERENCES users(id),
    status     VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    total_minor BIGINT NOT NULL CHECK (total_minor >= 0),
    currency   VARCHAR(8) NOT NULL DEFAULT 'XOF',
    -- TODO LIVE (Phase 2) : clé étrangère vers live_sessions
    live_session_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_buyer ON orders(buyer_id);

CREATE TABLE seller_orders (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id      UUID NOT NULL REFERENCES orders(id),
    shop_id       UUID NOT NULL REFERENCES shops(id),
    status        VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    subtotal_minor BIGINT NOT NULL CHECK (subtotal_minor >= 0),
    currency      VARCHAR(8) NOT NULL DEFAULT 'XOF',
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_seller_orders_shop ON seller_orders(shop_id);
CREATE INDEX idx_seller_orders_order ON seller_orders(order_id);

CREATE TABLE order_items (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_order_id  UUID NOT NULL REFERENCES seller_orders(id) ON DELETE CASCADE,
    product_id       UUID NOT NULL REFERENCES products(id),
    product_name     VARCHAR(200) NOT NULL,
    quantity         INT NOT NULL CHECK (quantity > 0),
    unit_price_minor BIGINT NOT NULL CHECK (unit_price_minor >= 0),
    created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_order_items_seller_order ON order_items(seller_order_id);

CREATE TABLE order_status_history (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id        UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    seller_order_id UUID REFERENCES seller_orders(id) ON DELETE CASCADE,
    from_status     VARCHAR(20),
    to_status       VARCHAR(20) NOT NULL,
    changed_by      UUID REFERENCES users(id),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TODO PAYMENT : paiement en ligne NON implémenté (paiement physique pour l'instant).
-- Cette table prépare l'intégration future d'un PaymentProvider (TMoney, Flooz, carte...).
CREATE TABLE payments (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id     UUID NOT NULL REFERENCES orders(id),
    provider     VARCHAR(50),
    status       VARCHAR(30) NOT NULL DEFAULT 'PAYMENT_PENDING',
    amount_minor BIGINT NOT NULL,
    currency     VARCHAR(8) NOT NULL DEFAULT 'XOF',
    reference    VARCHAR(120),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE legal_documents (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type          VARCHAR(40) NOT NULL,
    title         VARCHAR(200) NOT NULL,
    version       INT NOT NULL,
    content       TEXT NOT NULL,
    status        VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    published_at  TIMESTAMPTZ,
    effective_at  TIMESTAMPTZ,
    created_by    UUID REFERENCES users(id),
    updated_by    UUID REFERENCES users(id),
    change_summary TEXT,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (type, version)
);

CREATE TABLE legal_consents (
    id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id           UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    legal_document_id UUID NOT NULL REFERENCES legal_documents(id),
    document_version  INT NOT NULL,
    accepted_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
    ip_address        VARCHAR(60),
    user_agent        VARCHAR(500)
);
CREATE INDEX idx_legal_consents_user ON legal_consents(user_id);

CREATE TABLE audit_logs (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID REFERENCES users(id),
    action      VARCHAR(120) NOT NULL,
    entity_type VARCHAR(80),
    entity_id   VARCHAR(64),
    details     TEXT,
    ip_address  VARCHAR(60),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);
