import { BrowserRouter, Route, Routes } from 'react-router'
import { AuthenticatedLayout } from './layouts/authenticated'
import { ROUTES } from './lib/constants'
import { LoginPage } from './pages/login'
import { TimerPage } from './pages/timer'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={ROUTES.login} element={<LoginPage />} />
        <Route element={<AuthenticatedLayout />}>
          <Route path={ROUTES.timer} element={<TimerPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
