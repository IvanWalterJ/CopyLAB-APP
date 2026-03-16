'use server'

import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'

export async function login(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  
  const supabase = createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return redirect('/login?message=Could not authenticate user')
  }

  return redirect('/')
}

export async function signup(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const supabase = createClient()

  // Ensure you update your Supabase Project -> Authentication -> URL Configuration -> Site URL
  // to: http://localhost:3000 (or your production URL)
  // Otherwise, Supabase will redirect to whatever is set there by default.
  
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) {
    return redirect('/login?message=Could not authenticate user')
  }

  // Wait for email or redirect
  return redirect('/login?message=Revisa tu email para confirmar la cuenta')
}
