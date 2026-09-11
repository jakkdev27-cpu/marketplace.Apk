import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { errorMessage } from '../utils/format';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: { pathname?: string } } };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate(location.state?.from?.pathname ?? '/', { replace: true });
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
          <h1 className="card-title text-2xl justify-center">Connexion</h1>
          {error && <div className="alert alert-error text-sm">{error}</div>}
          <label className="form-control">
            <span className="label-text">Email</span>
            <input type="email" required className="input input-bordered" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label className="form-control">
            <span className="label-text">Mot de passe</span>
            <input type="password" required minLength={8} className="input input-bordered" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>
          <button className="btn btn-primary" disabled={loading}>{loading ? 'Connexion…' : 'Se connecter'}</button>
          <p className="text-sm text-center">
            Pas de compte ? <Link to="/register" className="link link-primary">S'inscrire</Link>
          </p>
        </form>
      </div>
    </div>
  );
}
