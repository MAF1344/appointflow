import {createAdminClient} from '@/lib/supabase/admin';
import {createClient} from '@/lib/supabase/server';
import {NextRequest, NextResponse} from 'next/server';
import {z} from 'zod';

const serviceSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  duration_minutes: z.number().int().positive(),
  price: z.number().nonnegative(),
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

export async function POST(request: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) {
    return NextResponse.json({error: 'Unauthorized'}, {status: 401});
  }

  const body = await request.json();
  const parsed = serviceSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({error: 'Data tidak valid'}, {status: 400});
  }

  const adminClient = createAdminClient();
  const {data, error} = await adminClient
    .from('services')
    .insert({...parsed.data, is_active: true})
    .select()
    .single();

  if (error) {
    return NextResponse.json({error: 'Gagal menambah layanan'}, {status: 500});
  }

  return NextResponse.json({service: data}, {status: 201});
}
