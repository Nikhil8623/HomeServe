import { FormEvent, useState } from 'react';
import { BriefcaseBusiness, Eye, EyeOff, HardHat, Home, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type AccountRole = 'user' | 'admin' | 'worker';

type AuthPageProps = { onComplete: () => void };

const roles: Array<{ id: AccountRole; label: string; description: string; icon: typeof UserRound }> = [
  { id: 'user', label: 'User login', description: 'Book trusted home services', icon: UserRound },
  { id: 'admin', label: 'Admin login', description: 'Manage the HomeServe platform', icon: ShieldCheck },
  { id: 'worker', label: 'Worker login', description: 'Manage jobs and appointments', icon: HardHat },
];

export default function AuthPage({ onComplete }: AuthPageProps) {
  const [role, setRole] = useState<AccountRole>('user');
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const selectedRole = roles.find((item) => item.id === role) ?? roles[0];

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    if (!supabase) {
      setMessage('Sign-in is temporarily unavailable. Please try again shortly.');
      setLoading(false);
      return;
    }

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, account_role: role } },
      });
      if (error) {
        setMessage(error.message);
      } else if (data.session) {
        onComplete();
      } else {
        setMessage('Your account was created. You can now sign in.');
        setIsSignUp(false);
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        onComplete();
      }
    }
    setLoading(false);
  };

  return (
    <main className="auth-page">
      <section className="auth-visual">
        <div className="auth-brand"><span className="auth-brand-mark"><Home size={19} /></span><span>HomeServe</span></div>
        <div className="auth-visual-copy"><span className="eyebrow">Home care, made simple</span><h1>Everything your home needs, in one place.</h1><p>Find skilled professionals across Mumbai, book with confidence, and keep your home running beautifully.</p></div>
        <div className="auth-visual-footer"><span>Trusted home services across Mumbai</span><span className="auth-dots"><i /><i /><i /></span></div>
      </section>
      <section className="auth-panel">
        <div className="auth-content">
          <div className="auth-mobile-brand"><span className="auth-brand-mark"><Home size={18} /></span><span>HomeServe</span></div>
          <span className="auth-kicker">Welcome back</span>
          <h2>{isSignUp ? 'Create your account' : 'Sign in to HomeServe'}</h2>
          <p className="auth-intro">Choose how you use HomeServe to continue.</p>
          <div className="role-grid" aria-label="Choose account type">
            {roles.map(({ id, label, description, icon: Icon }) => <button key={id} className={`role-option ${role === id ? 'selected' : ''}`} onClick={() => setRole(id)} type="button"><span className="role-icon"><Icon size={18} /></span><span><strong>{label}</strong><small>{description}</small></span></button>)}
          </div>
          <form onSubmit={handleSubmit} className="auth-form">
            {isSignUp && <label>Full name<input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your full name" required autoComplete="name" /></label>}
            <label>Email address<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required autoComplete="email" /></label>
            <label>Password<div className="password-field"><LockKeyhole size={17} /><input type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Enter your password" required minLength={6} autoComplete={isSignUp ? 'new-password' : 'current-password'} /><button type="button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? 'Hide password' : 'Show password'}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
            {message && <p className={`auth-message ${message.includes('created') ? 'success' : ''}`}>{message}</p>}
            <button className="auth-submit" type="submit" disabled={loading}>{loading ? 'Please wait...' : isSignUp ? `Create ${selectedRole.label.replace(' login', '')} account` : `Sign in as ${selectedRole.label.replace(' login', '')}`}<BriefcaseBusiness size={17} /></button>
          </form>
          <button className="auth-switch" onClick={() => { setIsSignUp((value) => !value); setMessage(''); }}>{isSignUp ? 'Already have an account? Sign in' : 'New to HomeServe? Create an account'}</button>
          <p className="auth-note">By continuing, you agree to HomeServe&apos;s terms and privacy policy.</p>
        </div>
      </section>
    </main>
  );
}
