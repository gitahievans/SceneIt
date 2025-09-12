'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

import { createClient } from '@/utils/supabase/server'

// add useful logs below
export async function login(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  if (typeof data.email !== "string" || typeof data.password !== "string") {
    throw new Error("Invalid form submission");
  }

  console.log("Login data", data)

  const { error } = await supabase.auth.signInWithPassword(data)

  if (error) {
    console.log("Login error", error)
    redirect('/error')
  }

  revalidatePath('/', 'layout')
  redirect('/?login=unloaded')
}

export async function signup(formData: FormData) {
  const supabase = await createClient()

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  if (typeof data.email !== "string" || typeof data.password !== "string") {
    throw new Error("Invalid form submission");
  }

  console.log("Signup data", data)

  const { error } = await supabase.auth.signUp(data)

  if (error) {
    console.log("Signup error", error)
    redirect('/error')
  }

  console.log("Signup success");
  console.log("Signup data", data);

  revalidatePath('/', 'layout')
  redirect('/?signup=pending')
}