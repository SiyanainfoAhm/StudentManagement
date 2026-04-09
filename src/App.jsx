import { AppRouter } from './router/AppRouter.jsx'
import { AuthProvider } from './context/AuthContext.jsx'

export function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  )
}

