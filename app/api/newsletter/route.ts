const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Newsletter sign-up. Validates the address and, when NEWSLETTER_WEBHOOK_URL is
 * configured, forwards it to that provider (e.g. a Mailchimp/Klaviyo/Zapier
 * webhook). Without a provider it responds in preview mode (`stored: false`)
 * so the UI never claims an address was saved when it wasn't.
 */
export async function POST(request: Request) {
  let body: { email?: unknown; company?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: real visitors never fill this field.
  if (typeof body.company === "string" && body.company.trim()) {
    return Response.json({ ok: true, stored: false });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  if (!EMAIL.test(email) || email.length > 254) {
    return Response.json({ ok: false, error: "Please enter a valid email address." }, { status: 422 });
  }

  const webhook = process.env.NEWSLETTER_WEBHOOK_URL;
  if (!webhook) {
    return Response.json({ ok: true, stored: false });
  }

  try {
    const res = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, source: "wildwoods-homepage" }),
    });
    if (!res.ok) throw new Error(`Provider responded ${res.status}`);
    return Response.json({ ok: true, stored: true });
  } catch {
    return Response.json(
      { ok: false, error: "We couldn't sign you up right now. Please try again later." },
      { status: 502 },
    );
  }
}
