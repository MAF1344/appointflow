import {createAdminClient} from '@/lib/supabase/admin';
import {createClient} from '@/lib/supabase/server';
import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';

const updateServiceSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  duration_minutes: z.number().int().positive().optional(),
  price: z.number().nonnegative().optional(),
  is_active: z.boolean().optional(),
});

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: {user},
  } = await supabase.auth.getUser();
  if (!user) return null;

  const {data: profile} = await supabase.from('profiles').select('role').eq('id', user.id).single();

  return profile?.role === 'ADMIN' ? user : null;
}

export async function PATCH(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const {id} = await params;
  const body = await request.json();
  const parsed = updateServiceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({error: 'Data tidak valid'}, {status: 400});
  }

  const adminClient = createAdminClient();
  const {data, error} = await adminClient.from('services').update(parsed.data).eq('id', id).select().single();

  if (error) {
    return NextResponse.json({error: 'Gagal mengubah layanan'}, {status: 500});
  }

  return NextResponse.json({service: data});
}
