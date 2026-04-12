import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

interface RouteParams {
  params: { token: string }
}

export async function PATCH(_request: NextRequest, { params }: RouteParams) {
  try {
    const { token } = params
    const supabase = createAdminClient()

    // Verify the token exists
    const { data: hire, error: fetchError } = await supabase
      .from('hires')
      .select('id, status')
      .eq('token', token)
      .single()

    if (fetchError || !hire) {
      return NextResponse.json({ error: 'Token invalide ou embauché introuvable' }, { status: 404 })
    }

    // Already confirmed — idempotent response
    if (hire.status === 'confirmed') {
      return NextResponse.json({ success: true, already_confirmed: true })
    }

    const { error: updateError } = await supabase
      .from('hires')
      .update({
        status: 'confirmed',
        confirmed_at: new Date().toISOString(),
      })
      .eq('id', hire.id)

    if (updateError) {
      console.error('confirm update error:', updateError)
      return NextResponse.json({ error: 'Erreur lors de la confirmation' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('confirm route error:', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
