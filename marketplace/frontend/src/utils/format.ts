/** Les montants sont stockés en unités mineures : 1 FCFA = 100 unités. */
export function formatPrice(minor: number, currency = 'XOF'): string {
  const amount = minor / 100;
  return `${amount.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} ${currency}`;
}

export function errorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const e = error as { response?: { data?: { message?: string } } };
    return e.response?.data?.message ?? 'Une erreur est survenue';
  }
  return 'Une erreur est survenue';
}
