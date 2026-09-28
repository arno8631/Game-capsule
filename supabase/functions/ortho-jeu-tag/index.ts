// ═══════════════════════════════════════════════════════════════════════
// ortho-jeu-tag — Ortho Invaders (Journées de l'Orthodontie)
//
// Appelée par la page capsule-med.com/pages/ortho-invaders dès qu'un praticien
// connecté arrive sur la borne. Tague son compte Shopify, qu'il vienne de
// s'inscrire ou qu'il ait déjà un compte :
//   jeuJO, jeuJO-2026            → tous les joueurs
//   jeuJO-inscrit                → compte créé pour le jeu (déjà posé par le formulaire d'inscription)
//   jeuJO-compte-existant        → praticien qui avait déjà un compte capsule
//
// Principes :
//  - on n'AJOUTE que ces tags, jamais rien d'autre, et on ne renvoie aucune
//    donnée client au navigateur ;
//  - déployée SANS vérification JWT (verify_jwt = false) : la page n'embarque
//    aucune clé Supabase. Contrôles propres : origine capsule-med.com,
//    identifiant numérique, client existant, ajout des seuls tags jeuJO ;
//  - l'identifiant client est déclaré par la page (pas prouvé) : au pire,
//    quelqu'un ajouterait « jeuJO » au compte d'un confrère. Sans autre effet.
// ═══════════════════════════════════════════════════════════════════════

import { createClient } from 'jsr:@supabase/supabase-js@2';

const ORIGINES = ['https://capsule-med.com', 'https://www.capsule-med.com', 'https://capsule-med.myshopify.com'];
const TAGS_JOUEUR = ['jeuJO', 'jeuJO-2026'];
const TAG_NOUVEAU = 'jeuJO-inscrit';
const TAG_EXISTANT = 'jeuJO-compte-existant';
// Compte créé il y a moins de 3 h : inscription faite pour le jeu
const FENETRE_NOUVEAU_MS = 3 * 3600 * 1000;

const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const BOUTIQUE = Deno.env.get('SHOPIFY_SHOP') ?? 'capsule-med.myshopify.com';
const JETON = Deno.env.get('SHOPIFY_ADMIN_TOKEN');

const entetes = (origine: string) => ({
  'Access-Control-Allow-Origin': ORIGINES.includes(origine) ? origine : ORIGINES[0],
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
});

async function shopify(query: string, variables: Record<string, unknown>) {
  const r = await fetch(`https://${BOUTIQUE}/admin/api/2025-07/graphql.json`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-Shopify-Access-Token': JETON! },
    body: JSON.stringify({ query, variables }),
  });
  if (!r.ok) throw new Error(`Shopify HTTP ${r.status}`);
  const data = await r.json();
  if (data?.errors) throw new Error(JSON.stringify(data.errors).slice(0, 300));
  return data.data;
}

Deno.serve(async (req) => {
  const origine = req.headers.get('origin') ?? '';
  const h = entetes(origine);
  const json = (c: unknown, s = 200) => new Response(JSON.stringify(c), { status: s, headers: { ...h, 'Content-Type': 'application/json' } });

  if (req.method === 'OPTIONS') return new Response('ok', { headers: h });
  if (req.method !== 'POST') return json({ erreur: 'Méthode' }, 405);
  if (!ORIGINES.includes(origine)) return json({ erreur: 'Origine refusée' }, 403);
  if (!JETON) return json({ erreur: 'Shopify non configuré' }, 503);

  let id = '';
  try {
    const corps = await req.json();
    id = String(corps?.customer_id ?? '').replace(/^gid:\/\/shopify\/Customer\//, '');
  } catch { /* corps invalide */ }
  if (!/^\d{1,20}$/.test(id)) return json({ erreur: 'Identifiant client invalide' }, 400);
  const gid = `gid://shopify/Customer/${id}`;

  try {
    const d = await shopify('query($id: ID!) { customer(id: $id) { id tags createdAt } }', { id: gid });
    const client = d?.customer;
    if (!client) return json({ erreur: 'Client introuvable' }, 404);

    const tags: string[] = client.tags ?? [];
    const nouveau = tags.includes(TAG_NOUVEAU) || Date.now() - Date.parse(client.createdAt) < FENETRE_NOUVEAU_MS;
    const voulus = [...TAGS_JOUEUR, nouveau ? TAG_NOUVEAU : TAG_EXISTANT];
    // Un compte déjà marqué « inscrit » par le formulaire garde ce statut.
    const aAjouter = voulus.filter((t) => !tags.includes(t) && !(t === TAG_EXISTANT && tags.includes(TAG_NOUVEAU)));

    if (aAjouter.length) {
      const r = await shopify(
        'mutation($id: ID!, $tags: [String!]!) { tagsAdd(id: $id, tags: $tags) { userErrors { message } } }',
        { id: gid, tags: aAjouter },
      );
      const err = r?.tagsAdd?.userErrors?.[0]?.message;
      if (err) throw new Error(err);
    }

    const { data: deja } = await db.from('ortho_jeu_joueurs').select('visites, tags_ajoutes').eq('customer_id', id).maybeSingle();
    await db.from('ortho_jeu_joueurs').upsert({
      customer_id: id,
      statut: nouveau ? 'nouveau' : 'existant',
      tags_ajoutes: [...new Set([...(deja?.tags_ajoutes ?? []), ...aAjouter])],
      visites: (deja?.visites ?? 0) + 1,
      derniere_visite: new Date().toISOString(),
      erreur: null,
    });
    return json({ ok: true, statut: nouveau ? 'nouveau' : 'existant' });
  } catch (e) {
    await db.from('ortho_jeu_joueurs').upsert({ customer_id: id, statut: 'existant', erreur: String(e).slice(0, 500), derniere_visite: new Date().toISOString() });
    return json({ erreur: 'Tag impossible pour le moment' }, 502);
  }
});
