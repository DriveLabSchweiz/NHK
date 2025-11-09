export type Lang = 'de'|'en';

export const t = (lang: Lang) => (key: string) => {
  const dict: Record<Lang, Record<string,string>> = {
    de: {
      siteTitle: 'Nothelferkurs Zürich',
      siteDesc: 'Offizieller Nothelferkurs in Zürich – Anmeldung, Termine & Bestätigung per E‑Mail.',
      bookNow: 'Kursplatz buchen',
      upcoming: 'Bevorstehende Kurse',
      minutesBefore: 'Erinnerung 24h vor Kursstart',
      signup: 'Kurs-Anmeldung',
      name: 'Vorname/Name',
      email: 'E-Mail',
      course: 'Kurs-Termin',
      submit: 'Verbindlich anmelden',
      success: 'Anmeldung eingegangen – Bestätigung folgt per E-Mail.',
      fail: 'Fehler beim Senden',
      language: 'Sprache',
      de: 'Deutsch',
      en: 'Englisch'
    },
    en: {
      siteTitle: 'Emergency Aid Course Zurich',
      siteDesc: 'Official First Aid (Nothelfer) course in Zurich – booking, dates & email confirmation.',
      bookNow: 'Book your seat',
      upcoming: 'Upcoming courses',
      minutesBefore: 'Reminder 24h before start',
      signup: 'Course booking',
      name: 'Full name',
      email: 'Email',
      course: 'Course date',
      submit: 'Book now',
      success: 'Booking received – confirmation sent by email.',
      fail: 'Sending failed',
      language: 'Language',
      de: 'German',
      en: 'English'
    }
  };
  return dict[lang][key] || key;
}
