import { Suspense, lazy, useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { I18nProvider } from '@/i18n';
import { ToastProvider } from '@/ds';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { AppShell } from '@/components/AppShell';
import { useApp } from '@/state/store';
import { Fox } from '@/mascot';
import { bindAudioUnlock } from '@/lib/feedback';
import { confirmAppStarted, hideSplash, initNative, markAppChrome } from '@/native';
import { LandingPage } from '@/features/landing/LandingPage';
import { SignInPage, SignUpPage, ResetPage } from '@/features/auth/AuthPages';
import { OnboardingPage } from '@/features/onboarding/OnboardingPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { PathPage } from '@/features/learn/PathPage';
import { UnitPage } from '@/features/learn/UnitPage';
import { ReviewPage } from '@/features/learn/ReviewPage';
import { StatsPage } from '@/features/stats/StatsPage';
import { ProfilePage } from '@/features/profile/ProfilePage';
import { NotFoundPage } from '@/features/misc/NotFoundPage';

// Chargement différé des écrans lourds ou rarement visités.
const PlacementPage = lazy(() =>
  import('@/features/placement/PlacementPage').then((m) => ({ default: m.PlacementPage }))
);
const LessonPage = lazy(() =>
  import('@/features/lesson/LessonPage').then((m) => ({ default: m.LessonPage }))
);
const CertificatePage = lazy(() =>
  import('@/features/certificate/CertificatePage').then((m) => ({ default: m.CertificatePage }))
);
const AssessmentPage = lazy(() =>
  import('@/features/certificate/AssessmentPage').then((m) => ({ default: m.AssessmentPage }))
);

function Splash() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface">
      <Fox size={96} animate />
      <p className="text-sm font-semibold text-ink-muted">Yumi</p>
    </div>
  );
}

function RequireAuth({ children }: { children: JSX.Element }) {
  const status = useApp((s) => s.status);
  const profile = useApp((s) => s.profile);
  const location = useLocation();

  if (status === 'loading') return <Splash />;
  if (status === 'anonymous') return <Navigate to="/signin" replace state={{ from: location.pathname }} />;
  const inSetup =
    location.pathname.startsWith('/onboarding') || location.pathname.startsWith('/placement');
  if (profile && !profile.placementDone && !inSetup) {
    return <Navigate to="/onboarding" replace />;
  }
  return children;
}

/**
 * Écran d'entrée.
 *
 * La page vitrine s'adresse à quelqu'un qui ne connaît pas Yumi. Un apprenant
 * déjà inscrit qui rouvre l'application n'a rien à y faire : il y voyait
 * « Se connecter » alors que sa session était intacte, et devait passer par le
 * bouton « J'ai un compte » pour rejoindre son tableau de bord. On attend donc
 * la restauration de la session avant de décider — quelques dizaines de
 * millisecondes, derrière le même écran de lancement que le reste.
 */
function RootRoute() {
  const status = useApp((s) => s.status);
  if (status === 'loading') return <Splash />;
  if (status === 'authenticated') return <Navigate to="/app" replace />;
  return <LandingPage />;
}

function PublicOnly({ children }: { children: JSX.Element }) {
  const status = useApp((s) => s.status);
  if (status === 'loading') return <Splash />;
  if (status === 'authenticated') return <Navigate to="/app" replace />;
  return children;
}

function ConnectivityWatcher() {
  const setOnline = useApp((s) => s.setOnline);
  useEffect(() => {
    const on = () => setOnline(true);
    const off = () => setOnline(false);
    window.addEventListener('online', on);
    window.addEventListener('offline', off);
    return () => {
      window.removeEventListener('online', on);
      window.removeEventListener('offline', off);
    };
  }, [setOnline]);
  return null;
}

export default function App() {
  const bootstrap = useApp((s) => s.bootstrap);

  useEffect(() => {
    // Plateforme : pilote haptique natif, reconnaissance vocale du système,
    // bouton retour Android, barre d'état. Inerte dans un navigateur.
    const stopNative = initNative();
    // Installée, Yumi est une application : un appui long n'y sélectionne pas
    // du texte. Ouverte dans un onglet, elle reste une page web ordinaire.
    const unmarkChrome = markAppChrome();
    // Les navigateurs n'autorisent le son qu'après un geste : on prépare le
    // contexte audio au premier appui, sans rien émettre.
    const unbindAudio = bindAudioUnlock();

    // L'écran de lancement natif reste affiché jusqu'à ce que la session soit
    // chargée — sinon l'application s'ouvre sur une page vide.
    void bootstrap().finally(() => {
      hideSplash();
      // L'application s'est affichée : cette version est déclarée saine. Sans
      // ce signal, une mise à jour défaillante serait automatiquement annulée
      // au profit de la précédente.
      confirmAppStarted();
    });

    return () => {
      stopNative();
      unmarkChrome();
      unbindAudio();
    };
  }, [bootstrap]);

  return (
    <ErrorBoundary>
      <I18nProvider>
        <ToastProvider>
          {/* HashRouter : la démo mono-fichier et l'ouverture directe d'un
              fichier statique fonctionnent sans configuration serveur. */}
          <HashRouter>
            <ConnectivityWatcher />
            <Suspense fallback={<Splash />}>
              <Routes>
                <Route path="/" element={<RootRoute />} />
                <Route
                  path="/signin"
                  element={
                    <PublicOnly>
                      <SignInPage />
                    </PublicOnly>
                  }
                />
                <Route
                  path="/signup"
                  element={
                    <PublicOnly>
                      <SignUpPage />
                    </PublicOnly>
                  }
                />
                <Route path="/reset" element={<ResetPage />} />
                <Route
                  path="/onboarding"
                  element={
                    <RequireAuth>
                      <OnboardingPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/placement"
                  element={
                    <RequireAuth>
                      <PlacementPage />
                    </RequireAuth>
                  }
                />
                <Route
                  path="/app"
                  element={
                    <RequireAuth>
                      <AppShell />
                    </RequireAuth>
                  }
                >
                  <Route index element={<DashboardPage />} />
                  <Route path="learn" element={<PathPage />} />
                  <Route path="learn/:unitId" element={<UnitPage />} />
                  <Route path="review" element={<ReviewPage />} />
                  <Route path="progress" element={<StatsPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="certificate/:certificateId" element={<CertificatePage />} />
                  <Route path="assessment/:trackId/:level" element={<AssessmentPage />} />
                </Route>
                <Route
                  path="/lesson/:lessonId"
                  element={
                    <RequireAuth>
                      <LessonPage />
                    </RequireAuth>
                  }
                />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </HashRouter>
        </ToastProvider>
      </I18nProvider>
    </ErrorBoundary>
  );
}
