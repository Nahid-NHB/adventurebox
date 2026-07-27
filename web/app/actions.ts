'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireAuth } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { parseForm, inputToRow } from '@/lib/activitySchema';

// --- Moderation ------------------------------------------------------------
// Same semantics as scripts/cms/moderate.ts: only touches AI-sourced rows.

export async function moderate(formData: FormData) {
  await requireAuth();
  const id = String(formData.get('id') ?? '');
  const status = String(formData.get('status') ?? '');
  if (!id || (status !== 'approved' && status !== 'rejected')) {
    throw new Error('Bad moderation request.');
  }
  const { error } = await supabaseAdmin()
    .from('activities')
    .update({ status })
    .eq('id', id)
    .eq('source', 'ai');
  if (error) throw new Error(error.message);
  revalidatePath('/moderation');
  revalidatePath('/');
}

// --- Activity library ------------------------------------------------------

export async function saveActivity(formData: FormData) {
  await requireAuth();
  const mode = String(formData.get('mode') ?? 'create');
  const input = parseForm(formData);
  const row = inputToRow(input);
  const sb = supabaseAdmin();

  if (mode === 'edit') {
    const { error } = await sb.from('activities').update(row).eq('id', input.id);
    if (error) throw new Error(error.message);
  } else {
    const { error } = await sb.from('activities').insert(row);
    if (error) throw new Error(error.message);
  }
  revalidatePath('/activities');
  revalidatePath('/');
  redirect('/activities');
}

export async function deleteActivity(formData: FormData) {
  await requireAuth();
  const id = String(formData.get('id') ?? '');
  if (!id) throw new Error('Missing id.');
  // Only curated library rows are deletable from here; family/AI data is theirs.
  const { error } = await supabaseAdmin()
    .from('activities')
    .delete()
    .eq('id', id)
    .eq('source', 'curated');
  if (error) throw new Error(error.message);
  revalidatePath('/activities');
  revalidatePath('/');
  redirect('/activities');
}
