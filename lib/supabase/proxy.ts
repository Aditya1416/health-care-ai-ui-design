import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || process.env.SUPABASE_URL?.trim()
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() || process.env.SUPABASE_ANON_KEY?.trim()

    if (!supabaseUrl || !supabaseAnonKey) {
      if (
        request.nextUrl.pathname.startsWith("/protected") ||
        request.nextUrl.pathname.startsWith("/admin") ||
        request.nextUrl.pathname.startsWith("/dashboard")
      ) {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        return NextResponse.redirect(url)
      }
      return NextResponse.next({ request })
    }

    let supabaseResponse = NextResponse.next({
      request,
    })

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) => supabaseResponse.cookies.set(name, value, options))
        },
      },
    })

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (request.nextUrl.pathname.startsWith("/protected") && !user) {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        return NextResponse.redirect(url)
      }
    } catch (authError) {
      if (request.nextUrl.pathname.startsWith("/protected")) {
        const url = request.nextUrl.clone()
        url.pathname = "/auth/login"
        return NextResponse.redirect(url)
      }
    }

    return supabaseResponse
  } catch (error) {
    console.error("[v0] Error in proxy middleware:", error)
    // Allow public pages to load even if middleware fails
    return NextResponse.next({ request })
  }
}
