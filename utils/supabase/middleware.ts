import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: DO NOT REMOVE auth.getUser()
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  if (pathname.startsWith('/api/')) {
    return supabaseResponse
  }

  const publicRoutes = ['/login', '/signup', '/auth/confirm', '/auth/callback', '/', '/details/']
  const isPublicRoute = publicRoutes.some(route => {
    if (route === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(route)
  })

  if (!user && !isPublicRoute) {
    const redirectResponse = NextResponse.redirect(new URL('/login', request.url))
    supabaseResponse.cookies.getAll().forEach(cookie => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie)
    })
    return redirectResponse
  }

  // If user exists and not on public routes or onboarding page, check onboarding status
  if (user && pathname !== '/onboarding') {

    const skipOnboardingCheck = ['/api/', '/auth/logout'].some(route =>
      pathname.startsWith(route)
    )

    if (!skipOnboardingCheck) {
      try {
        const { data: interests } = await supabase
          .from("user_interests")
          .select("id")
          .eq("user_id", user.id)
          .limit(1)

        if (!interests || interests.length === 0) {
          const onboardingResponse = NextResponse.redirect(new URL('/onboarding', request.url))
          supabaseResponse.cookies.getAll().forEach(cookie => {
            onboardingResponse.cookies.set(cookie.name, cookie.value, cookie)
          })
          return onboardingResponse
        }
      } catch (error) {
        console.error('Error checking user interests:', error)
      }
    }
  }

  // IMPORTANT: Return the supabaseResponse object to maintain session
  return supabaseResponse
}

// Export the main middleware function
export async function middleware(request: NextRequest) {
  return await updateSession(request)
}


export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}