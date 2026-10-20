import AccountForm from './account-form'
import { createClient } from '@/lib/supabase/server'
import './account.css'

export default async function Account() {
  const supabase = await createClient()

  const { data: claimsData } = await supabase.auth.getClaims()

  return <AccountForm claims={claimsData?.claims ?? null} />
}
