import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../auth/AuthContext';
import api from '../api/client';
import { errorMessage } from '../utils/format';
import type { LegalDocument } from '../types';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '' });
  const [seller, setSeller] = useState(false);
  const [accepted, setAccepted] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { data: legalDocs } = useQuery({
    queryKey: ['legal', 'published'],
    queryFn: async () => (await api.get<LegalDocument[]>('/legal/published')).data,
  });

  const toggle = (id: string) => {
    setAccepted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({ ...form, seller, acceptedDocumentIds: [...accepted] });
      navigate('/', { replace: true });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="card bg-base-100 shadow-xl">
        <form onSubmit={onSubmit} className="card-body">
          <h1 className="card-title text-2xl justify-center">Inscription</h1>
          {error && <div className="alert alert-error text-sm">{error}</div>}
          <div className="grid grid-cols-2 gap-2">
            <label className="form-control">
              <span className="label-text">Prénom</span>
              <input required className="input input-bordered" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
            </label>
            <label className="form-control">
              <span className="label-text">Nom</span>
              <input required className="input input-bordered" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
            </label>
          </div>
          <label className="form-control">
            <span className="label-text">Email</span>
            <input type="email" required className="input input-bordered" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </label>
          <label className="form-control">
            <span className="label-text">Mot de passe (8 caractères min.)</span>
            <input type="password" required minLength={8} className="input input-bordered" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
          </label>
          <label className="label cursor-pointer justify-start gap-2">
            <input type="checkbox" className="checkbox" checked={seller} onChange={(e) => setSeller(e.target.checked)} />
            <span className="label-text">Je m'inscris comme vendeur</span>
          </label>

          {(legalDocs ?? []).length > 0 && (
            <div className="border rounded-box p-3 space-y-2">
              <p className="text-sm font-semibold">Documents légaux — acceptation obligatoire :</p>
              {legalDocs!.map((doc) => (
                <label key={doc.id} className="label cursor-pointer justify-start gap-2">
                  <input type="checkbox" required className="checkbox checkbox-sm" checked={accepted.has(doc.id)} onChange={() => toggle(doc.id)} />
                  <span className="label-text text-sm">
                    J'accepte <Link to={`/legal/${doc.type.toLowerCase().replace(/_/g, '-')}`} target="_blank" className="link link-primary">{doc.title} (v{doc.version})</Link>
                  </span>
                </label>
              ))}
            </div>
          )}

          <button className="btn btn-primary" disabled={loading}>{loading ? 'Inscription…' : 'Créer mon compte'}</button>
          <p className="text-sm text-center">Déjà inscrit ? <Link to="/login" className="link link-primary">Connexion</Link></p>
        </form>
      </div>
    </div>
  );
}
