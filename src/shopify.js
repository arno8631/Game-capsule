// API Admin Shopify : attribution du lot au gagnant.
//  → code de réduction 100 % sur le replay choisi, à usage unique,
//    réservé au compte client connecté, + tag « gagnant » sur la fiche client.
const crypto = require('crypto');
const config = require('./config');

let cachedToken = null; // { value, expiresAt }

async function adminToken() {
  if (config.admin.token) return config.admin.token;
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60_000) return cachedToken.value;

  // Apps du Dev Dashboard : client credentials grant (jeton valable ~24 h).
  const res = await fetch(`https://${config.adminDomain}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: config.admin.clientId,
      client_secret: config.admin.clientSecret,
    }),
  });
  if (!res.ok) throw new Error(`Jeton Admin refusé (${res.status})`);
  const json = await res.json();
  cachedToken = { value: json.access_token, expiresAt: Date.now() + (json.expires_in || 3600) * 1000 };
  return cachedToken.value;
}

async function adminGraphql(query, variables) {
  const res = await fetch(`https://${config.adminDomain}/admin/api/${config.apiVersion}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': await adminToken(),
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (!res.ok || json.errors) {
    throw new Error(`Shopify Admin : ${JSON.stringify(json.errors || res.status)}`);
  }
  return json.data;
}

const CUSTOMER_TAGS = `query Customer($id: ID!) { customer(id: $id) { id tags } }`;

const CREATE_DISCOUNT = `mutation CreateArcadeReward($input: DiscountCodeBasicInput!) {
  discountCodeBasicCreate(basicCodeDiscount: $input) {
    codeDiscountNode { id }
    userErrors { field message code }
  }
}`;

const TAG_WINNER = `mutation TagWinner($id: ID!, $tags: [String!]!) {
  tagsAdd(id: $id, tags: $tags) { userErrors { field message } }
}`;

function makeCode() {
  // Sans caractères ambigus (0/O, 1/I) : lisible sur un téléphone.
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(6);
  return 'ORTHO-' + [...bytes].map((b) => alphabet[b % alphabet.length]).join('');
}

function redeemUrl(code, reward) {
  return `https://${config.storeDomain}/discount/${encodeURIComponent(code)}?redirect=${encodeURIComponent(`/products/${reward.handle}`)}`;
}

// Le client a-t-il déjà gagné (tag présent dans Shopify) ?
async function hasWinnerTag(customerId) {
  if (!config.adminEnabled) return false;
  const data = await adminGraphql(CUSTOMER_TAGS, { id: customerId });
  return Boolean(data.customer?.tags?.includes(config.winnerTag));
}

async function grantReward(customer, reward) {
  const code = makeCode();

  if (!config.adminEnabled) {
    // Mode démo : rien n'est créé dans Shopify.
    return { code: code.replace('ORTHO', 'DEMO'), url: redeemUrl('DEMO', reward), demo: true };
  }

  const now = new Date();
  const endsAt = new Date(now.getTime() + config.rewardValidityDays * 86_400_000);

  const data = await adminGraphql(CREATE_DISCOUNT, {
    input: {
      title: `Arcade Ortho — ${reward.id} — ${customer.email || customer.id}`,
      code,
      startsAt: now.toISOString(),
      endsAt: endsAt.toISOString(),
      usageLimit: 1,
      appliesOncePerCustomer: true,
      context: { customers: { add: [customer.id] } },
      customerGets: {
        value: { percentage: 1.0 },
        items: { products: { productsToAdd: [reward.productId] } },
      },
      combinesWith: { orderDiscounts: false, productDiscounts: false, shippingDiscounts: true },
    },
  });
  const errors = data.discountCodeBasicCreate.userErrors;
  if (errors.length) throw new Error(errors.map((e) => e.message).join(' · '));

  const tagged = await adminGraphql(TAG_WINNER, {
    id: customer.id,
    tags: [config.winnerTag, `arcade-lot-${reward.id}`],
  });
  if (tagged.tagsAdd.userErrors.length) {
    // Le code existe déjà : on ne bloque pas le gagnant, on trace seulement.
    console.warn('[shopify] tag non ajouté', tagged.tagsAdd.userErrors);
  }

  return { code, url: redeemUrl(code, reward), discountId: data.discountCodeBasicCreate.codeDiscountNode.id };
}

const CUSTOMER_PROFILE = `query CustomerProfile($id: ID!) {
  customer(id: $id) { id firstName lastName email tags }
}`;

// Ajoute des tags au client (jeuJO, jeuJO-2026, profession…). Sans API Admin : ignoré.
async function tagCustomer(customerId, tags) {
  if (!config.adminEnabled || !tags.length || !String(customerId).startsWith('gid://')) return false;
  const data = await adminGraphql(TAG_WINNER, { id: customerId, tags });
  if (data.tagsAdd.userErrors.length) throw new Error(data.tagsAdd.userErrors.map((e) => e.message).join(' · '));
  return true;
}

async function getCustomer(customerId) {
  const data = await adminGraphql(CUSTOMER_PROFILE, { id: customerId });
  return data.customer;
}

module.exports = { hasWinnerTag, grantReward, tagCustomer, getCustomer };
