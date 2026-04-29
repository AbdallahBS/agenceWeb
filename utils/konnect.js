const DEFAULT_KONNECT_BASE_URL = 'https://api.sandbox.konnect.network/api/v2';

function normalizePhoneNumber(phoneNumber) {
  const digitsOnly = String(phoneNumber || '').replace(/\D/g, '');
  if (!digitsOnly) return null;
  if (digitsOnly.startsWith('216') && digitsOnly.length === 11) {
    const local = digitsOnly.slice(3);
    return /^[1-9]\d{7}$/.test(local) ? local : null;
  }
  if (digitsOnly.length === 8 && /^[1-9]\d{7}$/.test(digitsOnly)) {
    return digitsOnly;
  }
  return null;
}

function getKonnectConfig() {
  const baseUrl = process.env.KONNECT_BASE_URL || DEFAULT_KONNECT_BASE_URL;
  const apiKey = process.env.KONNECT_API_KEY;
  const receiverWalletId = process.env.KONNECT_RECEIVER_WALLET_ID;
  const webhookUrl = process.env.KONNECT_WEBHOOK_URL;

  if (!apiKey) throw new Error('KONNECT_API_KEY manquant dans .env');
  if (!receiverWalletId) throw new Error('KONNECT_RECEIVER_WALLET_ID manquant dans .env');
  if (!webhookUrl) throw new Error('KONNECT_WEBHOOK_URL manquant dans .env');

  return { baseUrl, apiKey, receiverWalletId, webhookUrl };
}

async function initKonnectPayment({
  amount,
  description,
  firstName,
  lastName,
  phoneNumber,
  email,
  orderId,
  lifespanMinutes,
}) {
  const { baseUrl, apiKey, receiverWalletId, webhookUrl } = getKonnectConfig();
  const normalizedAmount = Math.round(Number(amount) * 1000);
  if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
    throw new Error('Montant Konnect invalide: amount doit etre > 0');
  }

  const safeOrderId = String(orderId || '')
    .replace(/[^a-zA-Z0-9_-]/g, '')
    .slice(0, 32);

  const payload = {
    receiverWalletId,
    token: 'TND',
    amount: normalizedAmount,
    type: 'immediate',
    description: String(description || 'Payment reservation'),
    acceptedPaymentMethods: ['wallet', 'bank_card', 'e-DINAR'],
    lifespan: lifespanMinutes,
    checkoutForm: true,
    addPaymentFeesToAmount: true,
    orderId: safeOrderId || `order_${Date.now()}`,
    webhook: webhookUrl,
    theme: 'dark',
  };
  const safePhone = normalizePhoneNumber(phoneNumber);
  if (safePhone) payload.phoneNumber = safePhone;
  if (firstName) payload.firstName = String(firstName).slice(0, 50);
  if (lastName) payload.lastName = String(lastName).slice(0, 50);
  if (email) payload.email = String(email).trim();

  const response = await fetch(`${baseUrl}/payments/init-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  let raw = {};
  try {
    raw = responseText ? JSON.parse(responseText) : {};
  } catch (e) {
    raw = { rawText: responseText };
  }

  if (!response.ok) {
    const details =
      raw?.message || raw?.error || raw?.detail || raw?.rawText || 'Erreur Konnect init-payment';
    const debugPayload = {
      receiverWalletId: payload.receiverWalletId,
      amount: payload.amount,
      token: payload.token,
      phoneNumber: payload.phoneNumber,
      email: payload.email,
      orderId: payload.orderId,
      webhook: payload.webhook,
      lifespan: payload.lifespan,
    };
    throw new Error(
      `Erreur Konnect init-payment (${response.status}): ${details} | payload=${JSON.stringify(
        debugPayload
      )}`
    );
  }

  const payUrl = raw.payUrl || raw.payURL || raw.paymentUrl;
  const paymentRef = raw.paymentRef || raw.ref || raw.paymentId;
  if (!payUrl || !paymentRef) {
    throw new Error(
      `Réponse Konnect invalide: payUrl/paymentRef manquants. Body=${JSON.stringify(raw)}`
    );
  }

  return {
    payUrl,
    paymentRef,
    raw,
  };
}

module.exports = { initKonnectPayment };
