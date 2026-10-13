import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { useAuth } from './authContext'
import { Layout } from './components/Layout'
import { LoginPage } from './pages/LoginPage'
import { CompaniesPage } from './pages/CompaniesPage'
import { CompanyPage } from './pages/CompanyPage'
import { XeroResultPage } from './pages/XeroResultPage'

function Protected() {
  const { authed } = useAuth()
  return authed ? <Layout><Outlet /></Layout> : <Navigate to="/login" replace />
}

export function App() {
  const { authed } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={authed ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/xero/result" element={<XeroResultPage />} />
      <Route element={<Protected />}>
        <Route path="/" element={<CompaniesPage />} />
        <Route path="/companies/:id/*" element={<CompanyPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
