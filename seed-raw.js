const SUPABASE_URL = 'https://cdpuzjfhrqkshdpstyoh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SlIDVzlZr5FjF6odYl4SHw_BN8jm-td';

const SEED_OPPORTUNITIES = [
  {
    id: "o1",
    title: { en: "Frontend Intern", mr: "फ्रंटएंड इंटर्न" },
    type: "Internship",
    company: "TCS Nashik",
    location: { en: "Nashik, Maharashtra", mr: "नाशिक, महाराष्ट्र" },
    deadline: "2026-04-15",
    mentor_id: "m1",
    industry: "Software",
    description: { en: "3-month internship in the Frontend team. Work on production apps.", mr: "Frontend टीममध्ये ३ महिन्यांची इंटर्नशिप. प्रत्यक्ष ॲप्सवर काम." },
    requirements: ["React knowledge", "HTML/CSS proficiency", "Currently studying CS"]
  }
];

async function seedRaw() {
  console.log('🚀 Attempting raw fetch seed for opportunities...');
  
  const response = await fetch(`${SUPABASE_URL}/rest/v1/opportunities`, {
    method: 'POST',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(SEED_OPPORTUNITIES)
  });

  if (!response.ok) {
    const err = await response.text();
    console.error('❌ Raw seed failed:', err);
  } else {
    console.log('✅ Raw seed successful!');
  }
}

seedRaw();
