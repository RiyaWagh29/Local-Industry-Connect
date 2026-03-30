import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cdpuzjfhrqkshdpstyoh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SlIDVzlZr5FjF6odYl4SHw_BN8jm-td';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SEED_MENTORS = [
  {
    id: "d14742f3-176b-4e8c-850d-d9b897645f1d",
    name: { en: "Rahul Deshmukh", mr: "राहुल देशमुख" },
    role: "Senior Software Engineer",
    company: "TCS Nashik",
    industries: ["Software"],
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    bio: { en: "10+ years experience in Full-stack development.", mr: "Full-stack development मध्ये १०+ वर्षांचा अनुभव." },
    skills: ["React", "Node.js", "Python", "System Design"],
    followers: 1240,
    communities: 2,
    posts: 45,
    experience: 12,
    guidance: { en: "Career guidance, code reviews, and Technical Mentorship.", mr: "करिअर मार्गदर्शन, कोड पुनरावलोकन आणि तांत्रिक मार्गदर्शकता." }
  },
  {
    id: "26938b81-64d7-408b-967c-6487e97228f2",
    name: { en: "Sandeep Patil", mr: "संदीप पाटील" },
    role: "Farm Operations Director",
    company: "Sahyadri Farms",
    industries: ["Agriculture"],
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    bio: { en: "Sustainable farming and agritech expert.", mr: "शाश्वत शेती आणि ॲग्रीटेक तज्ज्ञ." },
    skills: ["Agribusiness", "Crop Science", "Sustainability"],
    followers: 830,
    communities: 1,
    posts: 32,
    experience: 15,
    guidance: { en: "Agri-entrepreneurship and sustainable farming.", mr: "कृषी-उद्योजकता आणि शाश्वत शेती." }
  },
  {
    id: "a5598397-342b-41ea-b973-2b71ea197ec2",
    name: { en: "Dr. Amina Sheikh", mr: "डॉ. अमिना शेख" },
    role: "Chief Medical Officer",
    company: "Wockhardt Hospital",
    industries: ["Healthcare"],
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    bio: { en: "Healthcare management and research mentor.", mr: "आरोग्य व्यवस्थापन आणि संशोधन मार्गदर्शक." },
    skills: ["Clinical Research", "Healthcare Management", "Public Health"],
    followers: 2100,
    communities: 3,
    posts: 67,
    experience: 20,
    guidance: { en: "Medical career paths and healthcare innovation.", mr: "वैद्यकीय करिअर मार्ग आणि आरोग्य क्षेत्रातील नाविन्य." }
  },
  {
    id: "47209964-5785-4658-abf4-ff4e47209964",
    name: { en: "Manish Kulkarni", mr: "मनीष कुलकर्णी" },
    role: "VP of Finance",
    company: "HDFC Bank",
    industries: ["Finance"],
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    bio: { en: "Investment banking and fintech consultant.", mr: "इन्व्हेस्टमेंट बँकिंग आणि फिनटेक सल्लागार." },
    skills: ["Financial Analysis", "Risk Management", "Fintech"],
    followers: 960,
    communities: 1,
    posts: 28,
    experience: 14,
    guidance: { en: "Finance career path and fintech opportunities.", mr: "फायनान्स करिअर सल्ला आणि फिनटेक संधी." }
  },
  {
    id: "43876168-1033-4646-1ffa-d8d804387616",
    name: { en: "Priya Joshi", mr: "प्रिया जोशी" },
    role: "Product Design Lead",
    company: "Infosys",
    industries: ["Design"],
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    bio: { en: "UX/UI design systems expert.", mr: "UX/UI डिझाइन सिस्टिम तज्ज्ञ." },
    skills: ["UI/UX Design", "Figma", "Design Thinking"],
    followers: 1800,
    communities: 2,
    posts: 52,
    experience: 9,
    guidance: { en: "Portfolio reviews and design strategy.", mr: "पोर्टफोलिओ पुनरावलोकन आणि डिझाइन रणनीती." }
  },
  {
    id: "00648767-7910-40dc-c994-a43e50064876",
    name: { en: "Amit Bhosale", mr: "अमित भोसले" },
    role: "ML Engineer",
    company: "Persistent Systems",
    industries: ["Software"],
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    bio: { en: "Artificial Intelligence and Machine Learning specialist.", mr: "कृत्रिम बुद्धिमत्ता आणि मशीन लर्निंग तज्ज्ञ." },
    skills: ["Machine Learning", "Python", "TensorFlow", "NLP"],
    followers: 3200,
    communities: 2,
    posts: 89,
    experience: 8,
    guidance: { en: "AI/ML project mentorship and research paths.", mr: "AI/ML प्रकल्प मार्गदर्शन आणि संशोधन मार्ग." }
  }
];

const SEED_OPPORTUNITIES = [
  {
    id: "01150000-0000-4000-a000-000000000001",
    title: { en: "Frontend Intern", mr: "फ्रंटएंड इंटर्न" },
    type: "Internship",
    company: "TCS Nashik",
    location: { en: "Nashik, Maharashtra", mr: "नाशिक, महाराष्ट्र" },
    deadline: "2026-04-15",
    mentor_id: "d14742f3-176b-4e8c-850d-d9b897645f1d",
    industry: "Software",
    description: { en: "3-month internship in the Frontend team. Work on production apps.", mr: "Frontend टीममध्ये ३ महिन्यांची इंटर्नशिप. प्रत्यक्ष ॲप्सवर काम." },
    requirements: ["React knowledge", "HTML/CSS proficiency", "Currently studying CS"]
  }
];

async function runSeed() {
  console.log('🚀 Final Seeding Attempt with UUIDs...');
  
  for (const mentor of SEED_MENTORS) {
    const { error } = await supabase.from('profiles').upsert(mentor, { onConflict: 'id' });
    if (error) console.error(`❌ Mentor ${mentor.id} failed:`, error.message);
    else console.log(`✅ Mentor ${mentor.id} synchronized.`);
  }

  for (const opp of SEED_OPPORTUNITIES) {
    const { error } = await supabase.from('opportunities').upsert(opp, { onConflict: 'id' });
    if (error) console.error(`❌ Opp ${opp.id} failed:`, error.message);
    else console.log(`✅ Opp ${opp.id} synchronized.`);
  }
  
  const { data: pCount } = await supabase.from('profiles').select('id');
  const { data: oCount } = await supabase.from('opportunities').select('id');
  console.log(`TOTAL: ${pCount?.length || 0} profiles, ${oCount?.length || 0} opportunities.`);
}

runSeed();
