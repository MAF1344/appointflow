import {createServerClient} from '@supabase/ssr';
import {NextResponse, type NextRequest} from 'next/server';

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({request});

  const supabase = createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({name, value}) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({request});
        cookiesToSet.forEach(({name, value, options}) => supabaseResponse.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: {user},
  } = await supabase.auth.getUser();

  // Cek apakah request menuju area admin
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname === '/admin/login';

  if (isAdminRoute && !isLoginPage) {
    if (!user) {
      // Belum login sama sekali → redirect ke login
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }

    // Sudah login, tapi cek juga rolenya ADMIN
    const {data: profile} = await supabase.from('profiles').select('role').eq('id', user.id).single();

    if (profile?.role !== 'ADMIN') {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
