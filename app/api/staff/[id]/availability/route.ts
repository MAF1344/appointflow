import {createAdminClient} from '@/lib/supabase/admin';
import {createClient} from '@/lib/supabase/server';
import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';

const availabilitySchema = z.array(
  z.object({
    day_of_week: z.number().int().min(0).max(6),
    start_time: z.string(),
    end_time: z.string(),
  }),
);

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();
  if (!user) return null;

  const {data: profile} = await supabase.from('profiles').select('role').eq('id', user.id).single();

  return profile?.role === 'ADMIN' ? user : null;
}

// Replace semua availability staff ini dengan data baru
export async function PUT(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const {id: staffId} = await params;
  const body = await request.json();
  const parsed = availabilitySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({error: 'Data tidak valid'}, {status: 400});
  }

  const adminClient = createAdminClient();

  // Hapus semua jadwal lama staff ini, ganti dengan yang baru
  await adminClient.from('availability').delete().eq('staff_id', staffId);

  if (parsed.data.length > 0) {
    const {error} = await adminClient.from('availability').insert(parsed.data.map((item) => ({...item, staff_id: staffId})));

    if (error) {
      return NextResponse.json({error: 'Gagal menyimpan jadwal'}, {status: 500});
    }
  }

  return NextResponse.json({success: true});
}
