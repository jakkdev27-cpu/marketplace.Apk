package com.marketplace.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

// TODO PAYMENT : remplacer par une vraie intégration PaymentProvider (TMoney, Flooz, carte...).
// TODO PAYMENT WEBHOOK : endpoint de confirmation asynchrone à créer avec le provider choisi.
@Entity
@Table(name = "payments")
@Getter
@Setter
public class Payment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "order_id", nullable = false)
    private PurchaseOrder order;

    /** Fournisseur futur (tmoney, flooz, stripe, paypal...). NULL = paiement physique. */
    @Column(length = 50)
    private String provider;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PaymentStatus status = PaymentStatus.PAYMENT_PENDING;

    @Column(name = "amount_minor", nullable = false)
    private long amountMinor;

    @Column(nullable = false, length = 8)
    private String currency = "XOF";

    @Column(length = 120)
    private String reference;
}
