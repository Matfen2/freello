import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { SunIcon, MoonIcon } from '../components/icons';
import { api } from '../lib/api';

export function RegisterPage() {
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const [name, setName]           = useState('');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      await api.post('/v1/auth/register', {
        name: name || undefined,
        email,
        password,
      });
      navigate('/login?registered=1');
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        setError('Un compte existe déjà avec cet email.');
      } else {
        setError("Erreur lors de l'inscription. Réessayez.");
      }
    } finally {
      setLoading(false);
    }
  };

  const isValid = email.trim() && password.trim() && confirm.trim() && password === confirm;

  return (
    <div className="min-h-screen relative flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 overflow-hidden transition-colors">

      {/* Background blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-indigo-500/8 dark:bg-indigo-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-violet-500/8 dark:bg-violet-500/5 blur-3xl" />
      </div>

      {/* Theme toggle */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={toggleTheme}
        className="fixed top-4 right-4 p-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow"
        aria-label="Changer le thème"
        type="button"
      >
        <AnimatePresence mode="wait" initial={false}>
          {theme === 'dark' ? (
            <motion.div key="sun"
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: 90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <SunIcon className="w-4 h-4 text-yellow-400" />
            </motion.div>
          ) : (
            <motion.div key="moon"
              initial={{ rotate: 90, opacity: 0 }}
              animate={{ rotate: 0, opacity: 1 }}
              exit={{ rotate: -90, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <MoonIcon className="w-4 h-4 text-gray-500" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="w-full max-w-sm relative"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30 mb-4"
          >
            <svg className="w-6 h-6 ml-1.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
            </svg>
          </motion.div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50">Freello</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Créez votre compte gratuitement</p>
        </div>

        {/* Form card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl shadow-black/5 dark:shadow-black/30 border border-gray-200 dark:border-gray-800 p-7">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-5">
            Créer un compte
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl px-3 py-2.5"
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                  </svg>
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Nom */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Nom <span className="text-gray-400 font-normal normal-case tracking-normal">(optionnel)</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all"
                placeholder="Jean Dupont"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                  className={`w-full px-3.5 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 focus:border-transparent focus:bg-white transition-all bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 ${
                    confirm && password !== confirm
                      ? 'border-red-400 dark:border-red-600'
                      : 'border-gray-200 dark:border-gray-700'
                  }`}
                  placeholder="••••••••"
                />
                {confirm && password === confirm && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              {confirm && password !== confirm && (
                <p className="text-xs text-red-500 mt-1">Les mots de passe ne correspondent pas.</p>
              )}
            </div>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading || !isValid}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold text-sm transition-colors shadow-md shadow-indigo-500/20 mt-1 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Création…
                </>
              ) : "Créer mon compte"}
            </motion.button>
          </form>
        </div>

        {/* Link to login */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-5">
          Déjà un compte ?{' '}
          <Link
            to="/login"
            className="text-indigo-600 dark:text-indigo-400 font-medium hover:underline"
          >
            Se connecter
          </Link>
        </p>
      </motion.div>
    </div>
  );
}