import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

interface AdminAuthState {
  isAuthenticated: boolean;
  username: string | null;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => boolean;
}

const AdminAuthContext = createContext<AdminAuthState | null>(null);

const AUTH_KEY = 'seh_admin_credentials';
const SESSION_KEY = 'seh_admin_session';

interface Credentials {
  username: string;
  passwordHash: string;
}

/** Simple hash — NOT cryptographically secure. For production use a backend. */
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const chr = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return hash.toString(36);
}

function getCredentials(): Credentials {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* fall through */
  }
  // Default credentials
  return {
    username: 'admin@sunelitehomes.com',
    passwordHash: simpleHash('admin123'),
  };
}

function saveCredentials(creds: Credentials): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(creds));
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => sessionStorage.getItem(SESSION_KEY) === 'true',
  );
  const [username, setUsername] = useState<string | null>(() =>
    sessionStorage.getItem(SESSION_KEY) === 'true'
      ? sessionStorage.getItem(SESSION_KEY + '_user') || 'admin'
      : null,
  );

  const login = useCallback((user: string, password: string): boolean => {
    const creds = getCredentials();
    if (user === creds.username && simpleHash(password) === creds.passwordHash) {
      setIsAuthenticated(true);
      setUsername(user);
      sessionStorage.setItem(SESSION_KEY, 'true');
      sessionStorage.setItem(SESSION_KEY + '_user', user);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUsername(null);
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY + '_user');
  }, []);

  const changePassword = useCallback(
    (currentPassword: string, newPassword: string): boolean => {
      const creds = getCredentials();
      if (simpleHash(currentPassword) === creds.passwordHash) {
        creds.passwordHash = simpleHash(newPassword);
        saveCredentials(creds);
        return true;
      }
      return false;
    },
    [],
  );

  return (
    <AdminAuthContext.Provider
      value={{ isAuthenticated, username, login, logout, changePassword }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
