const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store'
  }
});

const clean = (value, max = 500) => String(value ?? '').trim().slice(0, max);
const escapeHtml = (value) => clean(value, 5000)
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#039;');

export async function onRequestPost(context) {
  try {
    const contentType = context.request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) return json({ error: 'Invalid request.' }, 415);

    const body = await context.request.json();
    if (clean(body.website, 200)) return json({ ok: true }); // honeypot

    const name = clean(body.name, 100);
    const email = clean(body.email, 160);
    const company = clean(body.company, 120);
    const projectType = clean(body.projectType, 120);
    const budget = clean(body.budget, 120);
    const message = clean(body.message, 4000);

    if (!name || !email || !message) return json({ error: 'Name, email and message are required.' }, 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Please enter a valid email address.' }, 400);

    const apiKey = context.env.RESEND_API_KEY;
    const to = context.env.CONTACT_TO_EMAIL || 'leonardofnferreira@gmail.com';
    const from = context.env.CONTACT_FROM_EMAIL || 'Leo Portfolio <onboarding@resend.dev>';
    if (!apiKey) return json({ error: 'Contact service is not configured yet.' }, 503);

    const subject = `Portfolio contact — ${projectType || 'New message'} — ${name}`.slice(0, 180);
    const html = `
      <div style="font-family:Arial,sans-serif;line-height:1.6;color:#17242d">
        <h2>New message from your portfolio</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Company:</strong> ${escapeHtml(company || '—')}</p>
        <p><strong>Project type:</strong> ${escapeHtml(projectType || '—')}</p>
        <p><strong>Budget / scope:</strong> ${escapeHtml(budget || '—')}</p>
        <hr style="border:0;border-top:1px solid #ddd;margin:24px 0">
        <p style="white-space:pre-wrap">${escapeHtml(message)}</p>
      </div>`;

    const resendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject,
        html
      })
    });

    if (!resendResponse.ok) {
      const detail = await resendResponse.text();
      console.error('Resend error:', detail);
      return json({ error: 'Email delivery failed.' }, 502);
    }

    return json({ ok: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return json({ error: 'Unexpected server error.' }, 500);
  }
}

export function onRequestGet() {
  return json({ error: 'Method not allowed.' }, 405);
}
