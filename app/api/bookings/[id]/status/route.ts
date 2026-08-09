import {createAdminClient} from '@/lib/supabase/admin';
import {createClient} from '@/lib/supabase/server';
import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED']),
});

export async function PATCH(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
  const {id} = await params;

  // 1. Pastikan yang request ini benar-benar admin yang login
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const {data: profile} = await supabase.from('profiles').select('role').eq('id', user.id).single();

  if (profile?.role !== 'ADMIN') {
    return NextResponse.json({error: 'Forbidden'}, {status: 403});
  }

  // 2. Validasi body request
  const body = await request.json();
  const parsed = updateStatusSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({error: 'Status tidak valid'}, {status: 400});
  }

  // 3. Update pakai admin client (bypass RLS, karena authorization sudah kita cek manual di atas)
  const adminClient = createAdminClient();
  const {data, error} = await adminClient.from('bookings').update({status: parsed.data.status}).eq('id', id).select().single();

  if (error) {
    return NextResponse.json({error: 'Gagal update status'}, {status: 500});
  }

  return NextResponse.json({booking: data});
}
