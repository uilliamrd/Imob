import { createServerClient } from "@supabase/ssr"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  // /api/admin/* — retornar JSON 401 se não autenticado
  if (pathname.startsWith("/api/admin/")) {
    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }
    return response
  }

  // /dashboard/* — redirecionar para /login se não autenticado
  if (pathname.startsWith("/dashboard/") || pathname === "/dashboard") {
    if (!user) {
      const loginUrl = new URL("/login", request.url)
      loginUrl.searchParams.set("next", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return response
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/admin/:path*"],
}
