import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../api/client';
import type { LegalDocument } from '../types';

const TYPE_MAP: Record<string, string> = {
  'privacy-policy': 'PRIVACY_POLICY',
  'terms': 'TERMS_OF_USE',
  'sales-terms': 'SALES_TERMS',
  'cookie-policy': 'COOKIE_POLICY',
  'refund-policy': 'REFUND_POLICY',
  'seller-terms': 'SELLER_TERMS',
};

export default function Legal() {
  const { type } = useParams<{ type: string }>();
  const docType = TYPE_MAP[type ?? ''];

  const doc = useQuery({
    queryKey: ['legal', docType],
    queryFn: async () => (await api.get<LegalDocument>(`/legal/published/${docType}`)).data,
    enabled: Boolean(docType),
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {doc.isLoading && <p className="text-center py-16">Chargement…</p>}
      {doc.isError && (
        <div className="alert alert-warning text-sm">
          Ce document n'est pas encore disponible. Il sera publié prochainement par l'administrateur.
        </div>
      )}
      {doc.data && (
        <article className="prose max-w-none">
          <h1>{doc.data.title}</h1>
          <p className="text-sm opacity-60">Version {doc.data.version} — en vigueur depuis le {doc.data.effectiveAt ? new Date(doc.data.effectiveAt).toLocaleDateString('fr-FR') : '—'}</p>
          <div dangerouslySetInnerHTML={{ __html: doc.data.content }} />
          <div className="alert alert-info text-sm mt-8">
            Avertissement : ce texte est un brouillon généré. Il doit être adapté au pays d'exploitation,
            aux données réellement traitées et validé par un professionnel du droit.
          </div>
        </article>
      )}
    </div>
  );
}
