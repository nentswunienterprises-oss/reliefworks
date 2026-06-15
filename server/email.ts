type TransactionalEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
};

export async function sendTransactionalEmail(input: TransactionalEmailInput): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;

  // Keep platform workflows non-blocking when email is not yet configured.
  if (!apiKey || !from) {
    return;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(`Email delivery failed: ${response.status} ${message}`);
  }
}
