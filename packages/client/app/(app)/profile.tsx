import Account from '../components/Account'
import { useAuth } from '../hooks/use-auth'

export default function Profile() {
  const { session } = useAuth()

  if (!session) return null
  return <Account session={session} />
} 