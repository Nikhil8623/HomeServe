import { useEffect, useState } from 'react';
import AuthPage from '@/components/AuthPage';
import UserDashboard from '@/components/UserDashboard';

export type AuthUser = {
  id?: number | string;
  fullName?: string;
  name?: string;
  email: string;
  role: string;
  token?: string;
  [key: string]: unknown;
};

const AUTH_STORAGE_KEY = 'homeserve.auth.user';

function readSavedUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      'email' in parsed &&
      'role' in parsed &&
      'token' in parsed &&
      typeof parsed.email === 'string' &&
      typeof parsed.role === 'string' &&
      typeof parsed.token === 'string'
    ) {
      return parsed as AuthUser;
    }
  } catch {
    // Ignore malformed or stale local session data.
  }
  localStorage.removeItem(AUTH_STORAGE_KEY);
  return null;
}

function App() {
  const [user, setUser] = useState<AuthUser | null>(() => readSavedUser());

  useEffect(() => {
    if (user?.token) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  const signOut = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  };

  if (!user) {
    return <AuthPage onComplete={setUser} />;
  }

  const role = user.role?.toUpperCase();

  if (role === 'CUSTOMER' || role === 'USER') {
    return <UserDashboard user={user} onSignOut={signOut} />;
  }

  return (
    <main style={{ padding: 40, textAlign: 'center' }}>
      <h2>HomeServe</h2>
      <p>Signed in as {user.role}.</p>
      <p>The dashboard for this account type has not been connected yet.</p>
      <button onClick={signOut}>Sign out</button>
    </main>
  );
}

export default App;
