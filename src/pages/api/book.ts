import type { APIRoute } from 'astro';
import { courses } from '../../../data/courses';

function findCourse(id: string){
  return courses.find(c => c.id === id);
}

function emailContent(lang: string, name: string, course: any){
  const dateStr_de = new Date(course.day1_start).toLocaleDateString('de-CH', {weekday:'long', day:'2-digit', month:'long', year:'numeric'});
  const dateStr_en = new Date(course.day1_start).toLocaleDateString('en-GB', {weekday:'long', day:'2-digit', month:'long', year:'numeric'});
  if(lang === 'en') {
    return {
      subject: 'Booking confirmed – Emergency Aid Course Zurich',
      text: `Hi ${name || ''},
Thanks for your booking for the Emergency Aid Course in Zurich.
Course start: ${dateStr_en} at 18:00.
Day 2: 09:00–17:00 (incl. 1h lunch).

Payment link (CHF 50 cashback at DriveLab):
https://drivelab.ch/en/lektion/pay-for-an-emergency-aid-course-zurich/

See you soon!`
    };
  }
  return {
    subject: 'Anmeldung bestätigt – Nothelferkurs Zürich',
    text: `Hallo ${name || ''},
Danke für deine Anmeldung zum Nothelferkurs in Zürich.
Kursstart: ${dateStr_de} um 18:00.
Tag 2: 09:00–17:00 (inkl. 1h Mittagspause).

Zahlung (CHF 50 Cashback bei DriveLab):
https://drivelab.ch/lektion/nothelferkurs-zuerich-bezahlen/

Bis bald!`
  };
}

function reminderContent(lang: string, course: any){
  const dateStr_de = new Date(course.day1_start).toLocaleDateString('de-CH', {weekday:'long', day:'2-digit', month:'long', year:'numeric'});
  const dateStr_en = new Date(course.day1_start).toLocaleDateString('en-GB', {weekday:'long', day:'2-digit', month:'long', year:'numeric'});
  return (lang === 'en')
    ? { subject: 'Reminder: Emergency Aid Course starts tomorrow', text: `Your course in Zurich starts tomorrow at 18:00 (${dateStr_en}).` }
    : { subject: 'Erinnerung: Nothelferkurs startet morgen', text: `Dein Kurs in Zürich startet morgen um 18:00 Uhr (${dateStr_de}).` };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { email, firstName, lastName, address, zip, city, birthdate, phone, notes, courseId, lang, accept_terms, accept_privacy, ['cf-turnstile-response']: cfToken } = await request.json();
    const name = `${firstName ?? ''} ${lastName ?? ''}`.trim();
    const cfSecret = import.meta.env.CF_TURNSTILE_SECRET;
    if (!email || !courseId || !firstName || !lastName || !address || !zip || !city || !birthdate || !phone || !accept_terms || !accept_privacy) {
      return new Response(JSON.stringify({ error: 'email_and_course_required' }), { status: 400 });
    }

    const mgDomain = import.meta.env.MAILGUN_DOMAIN;
    const mgKey = import.meta.env.MAILGUN_API_KEY;
    if (!mgDomain || !mgKey) {
      return new Response(JSON.stringify({ error: 'missing_env', details: 'MAILGUN_* env vars not set' }), { status: 500 });
    }

    // Verify Cloudflare Turnstile
if(!cfToken || !cfSecret){
  return new Response(JSON.stringify({ error: 'bot_check_failed' }), { status: 400 });
}
try{
  const cfRes = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ secret: cfSecret, response: cfToken })
  });
  const cfJson = await cfRes.json();
  if(!cfJson.success){
    return new Response(JSON.stringify({ error: 'turnstile_failed', details: cfJson }), { status: 400 });
  }
}catch(e){
  return new Response(JSON.stringify({ error: 'turnstile_error' }), { status: 400 });
}
const c = findCourse(courseId);
    if(!c){ return new Response(JSON.stringify({ error: 'invalid_course' }), { status: 400 }); }

    // 1) Immediate confirmation
    const conf = emailContent(lang || 'de', name, c);
    const admin = import.meta.env.ADMIN_EMAIL;
    const body1 = new URLSearchParams({
      from: `Nothelferkurs Zürich <noreply@${mgDomain}>`,
      to: email,
      subject: conf.subject,
      text: conf.text + `\n\nContact: ${name} / ${email} / ${phone}\nAddress: ${address}, ${zip} ${city}\nDOB: ${birthdate}\nNotes: ${notes || ''}`
    });
    let resp1 = await fetch(`https://api.mailgun.net/v3/${mgDomain}/messages`, {
      method: 'POST',
      headers: { Authorization: `Basic ${Buffer.from(`api:${mgKey}`).toString('base64')}` },
      if(admin) body1.append('bcc', admin);
      body: body1
    });
    if (!resp1.ok) {
      const err = await resp1.text();
      return new Response(JSON.stringify({ error: 'mailgun_failed', details: err }), { status: 500 });
    }

    // 2) Scheduled reminder 24h before start via Mailgun o:deliverytime
    const start = new Date(c.day1_start);
    const reminder = new Date(start.getTime() - 24*60*60*1000);
    const r = reminder.toUTCString(); // RFC 2822

    const rem = reminderContent(lang || 'de', c);
    const body2 = new URLSearchParams({
      from: `Nothelferkurs Zürich <noreply@${mgDomain}>`,
      to: email,
      subject: rem.subject,
      text: rem.text,
      'o:deliverytime': r
    });
    // If scheduled time already passed, send immediately (fall back)
    if(reminder.getTime() > Date.now()){
      await fetch(`https://api.mailgun.net/v3/${mgDomain}/messages`, {
        method: 'POST',
        headers: { Authorization: `Basic ${Buffer.from(`api:${mgKey}`).toString('base64')}` },
        body: body2
      });
    }

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'bad_request', details: e?.message || 'invalid json' }), { status: 400 });
  }
};
