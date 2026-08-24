import { FormEvent, useEffect, useState } from 'react';
import { createClient, Session } from '@supabase/supabase-js';
import { Activity, ArrowRight, BrainCircuit, LogOut, ShieldCheck, Sparkles } from 'lucide-react';
import M23MAnalyzer from './M23MAnalyzer';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const API_BASE = import.meta.env.VITE_API_URL || '';

const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    })
  : null;

function SignInPanel({ onAuthenticated }: { onAuthenticated: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'sign-in' | 'sign-up'>('sign-in');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || submitting) return;

    setSubmitting(true);
    setError(null);
    setMessage(null);

    const result = mode === 'sign-in'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password });

    setSubmitting(false);
    if (result.error) {
      setError(result.error.message);
      return;
    }

    if (mode === 'sign-up' && !result.data.session) {
      setMessage('Check your email to confirm your account, then return here to sign in.');
      return;
    }

    onAuthenticated();
  }

  return (
    <section className="auth-card" aria-labelledby="auth-title">
      <div className="icon-orb"><BrainCircuit size={28} /></div>
      <p className="eyebrow">TELsTP Unified Research</p>
      <h1 id="auth-title">Enter the M2-3M command interface</h1>
      <p className="section-copy">A verified TELsTP account is required before a research request can reach M2-3M.</p>
      <form onSubmit={handleSubmit} className="auth-form">
        <label>Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" /></label>
        <label>Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'} /></label>
        {error && <div className="callout error-callout" role="alert">{error}</div>}
        {message && <div className="callout success-callout" role="status">{message}</div>}
        <button className="primary-button full-width" type="submit" disabled={submitting}>
          {submitting ? 'Verifying…' : mode === 'sign-in' ? 'Sign in securely' : 'Create secured account'}
          <ArrowRight size={18} />
        </button>
      </form>
      <button className="text-button" type="button" onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}>
        {mode === 'sign-in' ? 'Need an account? Create one' : 'Already registered? Sign in'}
      </button>
    </section>
  );
}

export default function App() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  useEffect(() => {
    if (!supabase) {
      setSession(null);
      return undefined;
    }

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setSession(data.session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !API_BASE) {
    return (
      <main className="configuration-screen">
        <div className="configuration-card">
          <ShieldCheck size={32} />
          <p className="eyebrow">Standalone candidate</p>
          <h1>Protected configuration required</h1>
          <p>The M2-3M interface is intentionally inactive until its public Supabase settings and dedicated API URL are configured in the deployment environment.</p>
          <p className="muted">No provider, database, or user-data action has been performed.</p>
        </div>
      </main>
    );
  }

  if (session === undefined) {
    return <main className="configuration-screen"><div className="loading-card"><Activity className="spin" size={24} /> Verifying your session…</div></main>;
  }

  if (!session) {
    return <main className="auth-screen"><SignInPanel onAuthenticated={() => undefined} /></main>;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <a className="brand" href="#top" aria-label="TELsTP M2-3M Research">
          <span className="brand-mark"><Sparkles size={20} /></span>
          <span><strong>TELsTP M2-3M</strong><small>Unified research command interface</small></span>
        </a>
        <div className="header-actions">
          <span className="status-chip"><span className="status-dot" /> Verified session</span>
          <button className="secondary-button" onClick={() => supabase?.auth.signOut()}><LogOut size={16} /> Sign out</button>
        </div>
      </header>

      <main id="top" className="main-content">
        <section className="hero">
          <div>
            <p className="eyebrow">M2-3M × OmniCognitor</p>
            <h1>Research intelligence with a clear evidence boundary.</h1>
            <p>Use the standalone M2-3M interface for authenticated, rate-controlled research requests. Persistence and privileged data operations remain disabled in this candidate.</p>
          </div>
          <div className="hero-trust"><ShieldCheck size={24} /><span><strong>Isolated by design</strong><small>Identity is derived from your verified session—not a browser-supplied user ID.</small></span></div>
        </section>

        <M23MAnalyzer apiBase={API_BASE} accessToken={session.access_token} />
      </main>

      <footer className="app-footer">
        <span>TELsTP Life Science Technology Park</span>
        <span>Standalone M2-3M candidate · No analysis persistence</span>
      </footer>
    </div>
  );
}
