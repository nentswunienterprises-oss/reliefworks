import { createHash } from "crypto";

type PayfastConfig = {
  merchantId: string;
  merchantKey: string;
  passphrase?: string;
  sandbox?: boolean;
  returnUrl?: string;
  cancelUrl?: string;
  notifyUrl?: string;
};

type CreatePayfastPaymentUrlInput = {
  invoiceNumber: string;
  invoiceToken: string;
  amount: string;
  itemName: string;
  itemDescription?: string;
  customerEmail: string;
};

type CreatePayfastSubscriptionUrlInput = {
  subscriptionName: string;
  subscriptionToken: string;
  amount: string;
  customerEmail: string;
  itemDescription?: string;
  billingDate?: string; // YYYY-MM-DD, defaults to next month on same day
  cycleDay?: string; // "01" to "28" (day of month to bill)
  frequency?: "3" | "4" | "5" | "6"; // 3=monthly, 4=quarterly, 5=bi-annual, 6=annual
  cycles?: string; // number of payments, "0" for indefinite
};

type VerifyPayfastSignatureInput = {
  payload: Record<string, string | undefined>;
  passphrase?: string;
};

function sanitizePayfastValue(value: string | undefined): string {
  if (!value) {
    return "";
  }

  // Deployment env values occasionally arrive with trailing CRLF/whitespace,
  // which breaks the submitted query params and PayFast signature.
  return value.replace(/[\r\n]+$/g, "").trimEnd();
}

function encodeValue(value: string): string {
  return encodeURIComponent(value).replace(/%20/g, "+");
}

function buildSignature(baseParams: Record<string, string>, passphrase?: string): string {
  const query = Object.entries(baseParams)
    .filter(([, value]) => value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${encodeValue(sanitizePayfastValue(value))}`)
    .join("&");

  const sanitizedPassphrase = sanitizePayfastValue(passphrase);
  const signatureSeed = sanitizedPassphrase
    ? `${query}&passphrase=${encodeValue(sanitizedPassphrase)}`
    : query;

  return createHash("md5").update(signatureSeed).digest("hex");
}

export function verifyPayfastSignature(input: VerifyPayfastSignatureInput): boolean {
  const signature = (input.payload.signature || "").trim().toLowerCase();

  if (!signature) {
    return false;
  }

  const params = Object.entries(input.payload)
    .filter(([key]) => key !== "signature")
    .reduce<Record<string, string>>((acc, [key, value]) => {
      if (typeof value === "string") {
        acc[key] = sanitizePayfastValue(value);
      }

      return acc;
    }, {});

  const calculated = buildSignature(params, input.passphrase).toLowerCase();

  if (calculated === signature) {
    return true;
  }

  const sortedParams = Object.keys(params)
    .sort((a, b) => a.localeCompare(b))
    .reduce<Record<string, string>>((acc, key) => {
      acc[key] = params[key];
      return acc;
    }, {});

  const fallback = buildSignature(sortedParams, input.passphrase).toLowerCase();
  return fallback === signature;
}

export function isTrustedPayfastSource(
  ipAddress: string | undefined,
  trustedIpsCsv: string | undefined,
): boolean {
  if (!trustedIpsCsv || !trustedIpsCsv.trim()) {
    return true;
  }

  if (!ipAddress) {
    return false;
  }

  const normalizedIp = ipAddress.replace(/^::ffff:/, "");
  const trusted = trustedIpsCsv
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => entry.replace(/^::ffff:/, ""));

  return trusted.includes(normalizedIp);
}

export function createPayfastPaymentUrl(
  config: PayfastConfig,
  input: CreatePayfastPaymentUrlInput,
): { paymentLink: string; reference: string } {
  const sanitizedConfig = {
    merchantId: sanitizePayfastValue(config.merchantId),
    merchantKey: sanitizePayfastValue(config.merchantKey),
    passphrase: sanitizePayfastValue(config.passphrase),
    returnUrl: sanitizePayfastValue(config.returnUrl),
    cancelUrl: sanitizePayfastValue(config.cancelUrl),
    notifyUrl: sanitizePayfastValue(config.notifyUrl),
  };
  const baseUrl = config.sandbox
    ? "https://sandbox.payfast.co.za"
    : "https://www.payfast.co.za";

  const params: Record<string, string> = {
    merchant_id: sanitizedConfig.merchantId,
    merchant_key: sanitizedConfig.merchantKey,
    return_url: sanitizedConfig.returnUrl,
    cancel_url: sanitizedConfig.cancelUrl,
    notify_url: sanitizedConfig.notifyUrl,
    m_payment_id: sanitizePayfastValue(input.invoiceToken),
    amount: sanitizePayfastValue(input.amount),
    item_name: sanitizePayfastValue(input.itemName),
    item_description: sanitizePayfastValue(input.itemDescription),
    email_address: sanitizePayfastValue(input.customerEmail),
  };

  const signature = buildSignature(params, sanitizedConfig.passphrase);
  const query = Object.entries(params)
    .filter(([, value]) => value !== "")
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${encodeValue(sanitizePayfastValue(value))}`)
    .join("&");

  return {
    paymentLink: `${baseUrl}/eng/process?${query}&signature=${signature}`,
    reference: input.invoiceToken,
  };
}

export function createPayfastSubscriptionUrl(
  config: PayfastConfig,
  input: CreatePayfastSubscriptionUrlInput,
): { paymentLink: string; reference: string } {
  const baseUrl = config.sandbox
    ? "https://sandbox.payfast.co.za"
    : "https://www.payfast.co.za";

  // Calculate default billing date (next month, same day)
  const today = new Date();
  const billingDateObj = new Date(today);
  billingDateObj.setMonth(billingDateObj.getMonth() + 1);

  const defaultBillingDate = billingDateObj.toISOString().split("T")[0];
  const billingDate = input.billingDate || defaultBillingDate;

  // Default to monthly billing on the current day of month
  const cycleDay = input.cycleDay || String(today.getDate()).padStart(2, "0");
  const frequency = input.frequency || "3"; // 3 = monthly
  const cycles = input.cycles || "0"; // 0 = indefinite

  const params: Record<string, string> = {
    merchant_id: config.merchantId,
    merchant_key: config.merchantKey,
    return_url: config.returnUrl || "",
    cancel_url: config.cancelUrl || "",
    notify_url: config.notifyUrl || "",
    subscription: "1", // Enable recurring
    m_payment_id: input.subscriptionToken,
    amount: input.amount,
    item_name: input.subscriptionName,
    item_description: input.itemDescription || "",
    email_address: input.customerEmail,
    billing_date: billingDate,
    cycle_day: cycleDay,
    frequency: frequency,
    cycles: cycles,
  };

  const signature = buildSignature(params, config.passphrase);
  const query = Object.entries(params)
    .filter(([, value]) => value !== "")
    .map(([key, value]) => `${key}=${encodeValue(value)}`)
    .join("&");

  return {
    paymentLink: `${baseUrl}/eng/process?${query}&signature=${signature}`,
    reference: input.subscriptionToken,
  };
}
