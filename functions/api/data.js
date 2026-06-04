const KV_KEY = 'db';

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export async function onRequestOptions() {
  return new Response(null, { status: 204, headers: corsHeaders() });
}

export async function onRequestGet({ env }) {
  try {
    const raw = await env.ASSET_TRACKER_KV.get(KV_KEY);
    if (!raw) {
      return Response.json(
        { products: [], assetTypes: [], checks: {}, assignees: {}, comments: {}, driveLinks: {} },
        { headers: corsHeaders() }
      );
    }
    return new Response(raw, {
      headers: { 'Content-Type': 'application/json', ...corsHeaders() },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders() });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    const body = await request.text();
    const parsed = JSON.parse(body);
    if (!Array.isArray(parsed.products)) {
      return Response.json({ error: 'Invalid payload' }, { status: 400, headers: corsHeaders() });
    }
    await env.ASSET_TRACKER_KV.put(KV_KEY, body);
    return Response.json({ ok: true, ts: Date.now() }, { headers: corsHeaders() });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500, headers: corsHeaders() });
  }
}
