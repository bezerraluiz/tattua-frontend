import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AwaitEmailVerification } from './pages/auth/AwaitEmailVerification';
import { DashboardPage } from './pages/app/DashboardPage';
import { QuotesPage } from './pages/app/QuotesPage';
import { QuoteBuilderPage } from './pages/app/QuoteBuilderPage';
import { BillingPage } from './pages/app/BillingPage';
import { SettingsPage } from './pages/app/SettingsPage';
import { ProfilePage } from './pages/app/ProfilePage';
import { PaymentPage } from './pages/app/PaymentPage';
import { ErrorPage } from './pages/ErrorPage';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>        
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
  <Route path="/register" element={<RegisterPage />} />
  <Route path="/aguarde-verificacao" element={<AwaitEmailVerification />} />
  <Route path="/erro" element={<ErrorPage />} />
  <Route element={<ProtectedRoute />}>          
          <Route path="/app" element={<DashboardPage />} />
          <Route path="/app/orcamentos" element={<QuotesPage />} />
          <Route path="/app/orcamentos/novo" element={<QuoteBuilderPage />} />
          <Route path="/app/billing" element={<BillingPage />} />
          <Route path="/app/pagamento" element={<PaymentPage />} />
          <Route path="/app/configuracoes" element={<SettingsPage />} />
          <Route path="/app/perfil" element={<ProfilePage />} />
        </Route>
      </Route>
    </Routes>
  );
}
