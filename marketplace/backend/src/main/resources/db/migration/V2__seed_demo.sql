-- ============================================================
-- Données de démonstration — À SUPPRIMER ou adapter en production.
-- Comptes de démo :
--   admin@demo.fr / Admin12345!  (ADMIN)
--   seller@demo.fr / Seller12345! (VENDEUR)
--   buyer@demo.fr / Buyer12345!  (ACHETEUR)
-- ============================================================

INSERT INTO users (id, email, password_hash, first_name, last_name, role) VALUES
    ('11111111-1111-1111-1111-111111111111', 'admin@demo.fr', '$2b$10$r6B8E09EMW7u/EI9pN3DruxBdQlBBwGjo.tDk/JzwO9ylmaEhH8AW', 'Admin', 'Plateforme', 'ADMIN'),
    ('22222222-2222-2222-2222-222222222222', 'seller@demo.fr', '$2b$10$8pijWdyi/3fbHIS5dRP7VuQB/Nczv8NuV5xrE8JFvGtWdGvFPdtb2', 'Afi', 'Vendeur', 'SELLER'),
    ('33333333-3333-3333-3333-333333333333', 'buyer@demo.fr', '$2b$10$z5cHvEUPbXG9jSPMlE559eRzyoejkWukqM9OriR0IXc3kB9wCybrS', 'Kossi', 'Acheteur', 'BUYER');

INSERT INTO shops (id, seller_id, name, slug, description, slogan, address) VALUES
    ('44444444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222',
     'Boutique Démo Lomé', 'boutique-demo-lome',
     'Boutique de démonstration : mode et accessoires à Lomé.', 'Qualité locale, prix justes',
     'Rue de la Paix, Lomé, Togo');

INSERT INTO categories (id, name, slug, description) VALUES
    ('55555555-5555-5555-5555-555555555551', 'Mode', 'mode', 'Vêtements et accessoires'),
    ('55555555-5555-5555-5555-555555555552', 'Électronique', 'electronique', 'Téléphones, audio, accessoires'),
    ('55555555-5555-5555-5555-555555555553', 'Maison', 'maison', 'Décoration et équipement de la maison');

-- Prix en unités mineures : 1 FCFA = 100 unités (arrondis exacts, pas de float).
INSERT INTO products (id, shop_id, category_id, name, description, price_minor, old_price_minor, stock, reference, images) VALUES
    ('66666666-6666-6666-6666-666666666661', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555551',
     'T-shirt wax authentique', 'T-shirt en tissu wax, coupe moderne, tailles S à XXL.', 1500000, 2000000, 25, 'WAX-TS-001',
     '["https://picsum.photos/seed/wax1/800/800"]'),
    ('66666666-6666-6666-6666-666666666662', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555551',
     'Sac à main tressé', 'Sac fait main par des artisanes de Lomé.', 3500000, NULL, 10, 'SAC-002',
     '["https://picsum.photos/seed/sac1/800/800"]'),
    ('66666666-6666-6666-6666-666666666663', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555552',
     'Écouteurs Bluetooth', 'Écouteurs sans fil, autonomie 20h, micro intégré.', 9000000, 12000000, 15, 'AUDIO-003',
     '["https://picsum.photos/seed/audio1/800/800"]'),
    ('66666666-6666-6666-6666-666666666664', '44444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555553',
     'Lampe de chevet bois', 'Lampe artisanale en bois recyclé, ampoule LED incluse.', 2200000, NULL, 8, 'MAISON-004',
     '["https://picsum.photos/seed/lampe1/800/800"]');

-- Documents légaux v1 (brouillons générés — faire valider par un professionnel).
INSERT INTO legal_documents (id, type, title, version, content, status, published_at, effective_at, change_summary) VALUES
    ('77777777-7777-7777-7777-777777777771', 'PRIVACY_POLICY', 'Politique de confidentialité', 1,
     '<p><strong>Brouillon généré automatiquement.</strong> Ce texte doit être adapté au pays d''exploitation, aux données réellement traitées et validé par un professionnel du droit.</p><p>Données traitées : compte, commandes, adresse de livraison, historique de navigation, cookies techniques.</p>',
     'PUBLISHED', now(), now(), 'Version initiale (brouillon)'),
    ('77777777-7777-7777-7777-777777777772', 'TERMS_OF_USE', 'Conditions générales d''utilisation', 1,
     '<p><strong>Brouillon généré automatiquement.</strong> Conditions d''utilisation de la plateforme : compte, contenus, responsabilités.</p>',
     'PUBLISHED', now(), now(), 'Version initiale (brouillon)'),
    ('77777777-7777-7777-7777-777777777773', 'SALES_TERMS', 'Conditions générales de vente', 1,
     '<p><strong>Brouillon généré automatiquement.</strong> Conditions de vente entre vendeurs et acheteurs.</p>',
     'PUBLISHED', now(), now(), 'Version initiale (brouillon)'),
    ('77777777-7777-7777-7777-777777777774', 'COOKIE_POLICY', 'Politique de cookies', 1,
     '<p><strong>Brouillon généré automatiquement.</strong> Cookies techniques et de mesure d''audience.</p>',
     'PUBLISHED', now(), now(), 'Version initiale (brouillon)'),
    ('77777777-7777-7777-7777-777777777775', 'REFUND_POLICY', 'Politique de remboursement', 1,
     '<p><strong>Brouillon généré automatiquement.</strong> Conditions de retour et remboursement.</p>',
     'PUBLISHED', now(), now(), 'Version initiale (brouillon)'),
    ('77777777-7777-7777-7777-777777777776', 'SELLER_TERMS', 'Conditions vendeurs', 1,
     '<p><strong>Brouillon généré automatiquement.</strong> Obligations des vendeurs, commissions, modération.</p>',
     'PUBLISHED', now(), now(), 'Version initiale (brouillon)');
