// Connexion avec le compte client Capsule (Shopify).
//  - customer-account : OAuth 2.0 + PKCE sur la Customer Account API (nouveaux comptes clients)
//  - storefront       : email + mot de passe via la Storefront API (comptes classiques)
//  - demo             : prénom + email, sans vérification (tests)
const crypto = require('crypto');
const express = require('express');
const config = require('./config');

const router = express.Router();
router.use(express.json());

const b64url = (buf) => buf.toString('base64url');

function displayName(c) {
  const first = (c.firstName || '').trim();
  const lastInitial = (c.lastName || '').trim().charAt(0);
  if (first) return `${first}${lastInitial ? ` ${lastInitial}.` : ''}`;
  return (c.email || 'Joueur').split('@')[0];
}

function login(req, customer) {
  req.session.customer = { ...customer, name: displayName(customer) };
}

// Ne renvoie que vers /play (évite les redirections ouvertes).
function playUrl(room) {
  return /^[A-Z0-9]{4}$/.test(room || '') ? `/play?room=${room}` : '/play';
}

router.get('/api/me', (req, res) => {
  res.json({ customer: req.session.customer || null, authMode: config.authMode });
});

router.post('/auth/logout', (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

// ── Customer Account API (OAuth) ────────────────────────────
let discovery = null;
async function discover() {
  if (discovery) return discovery;
  const base = `https://${config.storeDomain}/.well-known`;
  const [oidc, api] = await Promise.all([
    fetch(`${base}/openid-configuration`).then((r) => r.json()),
    fetch(`${base}/customer-account-api`).then((r) => r.json()),
  ]);
  discovery = { ...oidc, graphqlApi: api.graphql_api };
  return discovery;
}

router.get('/auth/login', async (req, res, next) => {
  if (config.authMode !== 'customer-account') return res.redirect(playUrl(req.query.room));
  try {
    const d = await discover();
    const verifier = b64url(crypto.randomBytes(32));
    const state = b64url(crypto.randomBytes(16));
    req.session.oauth = { verifier, state, room: req.query.room };

    const url = new URL(d.authorization_endpoint);
    url.search = new URLSearchParams({
      client_id: config.customerAccount.clientId,
      scope: 'openid email customer-account-api:full',
      response_type: 'code',
      redirect_uri: `${config.publicUrl}/auth/callback`,
      state,
      nonce: b64url(crypto.randomBytes(16)),
      code_challenge: b64url(crypto.createHash('sha256').update(verifier).digest()),
      code_challenge_method: 'S256',
      locale: 'fr',
    }).toString();
    res.redirect(url.toString());
  } catch (err) {
    next(err);
  }
});

router.get('/auth/callback', async (req, res, next) => {
  const pending = req.session.oauth;
  if (!pending || req.query.state !== pending.state || !req.query.code) {
    return res.status(400).send('Connexion expirée : rescannez le QR code de la borne.');
  }
  delete req.session.oauth;
  try {
    const d = await discover();
    const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
    if (config.customerAccount.clientSecret) {
      headers.Authorization = 'Basic ' + Buffer.from(
        `${config.customerAccount.clientId}:${config.customerAccount.clientSecret}`,
      ).toString('base64');
    }
    const tokenRes = await fetch(d.token_endpoint, {
      method: 'POST',
      headers,
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: config.customerAccount.clientId,
        redirect_uri: `${config.publicUrl}/auth/callback`,
        code: req.query.code,
        code_verifier: pending.verifier,
      }),
    });
    const tokens = await tokenRes.json();
    if (!tokenRes.ok) throw new Error(`Échange du code refusé : ${JSON.stringify(tokens)}`);

    const meRes = await fetch(d.graphqlApi, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: tokens.access_token },
      body: JSON.stringify({
        query: 'query Me { customer { id firstName lastName emailAddress { emailAddress } } }',
      }),
    });
    const me = await meRes.json();
    const c = me.data?.customer;
    if (!c) throw new Error(`Profil client introuvable : ${JSON.stringify(me.errors)}`);

    login(req, {
      id: c.id,
      firstName: c.firstName,
      lastName: c.lastName,
      email: c.emailAddress?.emailAddress,
      source: 'customer-account',
    });
    res.redirect(playUrl(pending.room));
  } catch (err) {
    next(err);
  }
});

// ── Storefront API (comptes classiques) ─────────────────────
async function storefront(query, variables) {
  const res = await fetch(`https://${config.storeDomain}/api/${config.apiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': config.storefrontToken,
    },
    body: JSON.stringify({ query, variables }),
  });
  return res.json();
}

router.post('/auth/storefront', async (req, res) => {
  if (config.authMode !== 'storefront') return res.status(404).end();
  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis.' });
  try {
    const created = await storefront(
      `mutation Login($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken { accessToken }
          customerUserErrors { message }
        }
      }`,
      { input: { email, password } },
    );
    const token = created.data?.customerAccessTokenCreate?.customerAccessToken?.accessToken;
    if (!token) return res.status(401).json({ error: 'Identifiants Capsule incorrects.' });

    const me = await storefront(
      'query Me($t: String!) { customer(customerAccessToken: $t) { id email firstName lastName } }',
      { t: token },
    );
    const c = me.data?.customer;
    if (!c) return res.status(401).json({ error: 'Compte introuvable.' });
    login(req, { ...c, source: 'storefront' });
    res.json({ customer: req.session.customer });
  } catch (err) {
    console.error('[auth] storefront', err);
    res.status(502).json({ error: 'Shopify ne répond pas, réessayez.' });
  }
});

// ── Démo ────────────────────────────────────────────────────
router.post('/auth/demo', (req, res) => {
  if (config.authMode !== 'demo') return res.status(404).end();
  const firstName = String(req.body?.firstName || '').trim().slice(0, 20);
  const email = String(req.body?.email || '').trim().toLowerCase().slice(0, 80);
  if (!firstName || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: 'Prénom et email valides requis.' });
  }
  const id = 'demo:' + crypto.createHash('sha1').update(email).digest('hex').slice(0, 12);
  login(req, { id, firstName, lastName: '', email, source: 'demo' });
  res.json({ customer: req.session.customer });
});

module.exports = router;
