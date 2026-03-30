import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://cdpuzjfhrqkshdpstyoh.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_SlIDVzlZr5FjF6odYl4SHw_BN8jm-td';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const SEED_MENTORS = [
  {
    id: "m1",
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
    id: "m2",
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
    id: "m3",
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
    id: "m4",
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
    id: "m5",
    name: { en: "Priya Joshi", mr: "प्रिया जोशी" },
    role: "Product Design Lead",
    company: "Infosys",
    industries: ["Design"],
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&face",
    bio: { en: "UX/UI design systems expert.", mr: "UX/UI डिझाइन सिस्टिम तज्ज्ञ." },
    skills: ["UI/UX Design", "Figma", "Design Thinking"],
    followers: 1800,
    communities: 2,
    posts: 52,
    experience: 9,
    guidance: { en: "Portfolio reviews and design strategy.", mr: "पोर्टफोलिओ पुनरावलोकन आणि डिझाइन रणनीती." }
  },
  {
    id: "m6",
    name: { en: "Amit Bhosale", mr: "अमित भोसले" },
    role: "ML Engineer",
    company: "Persistent Systems",
    industries: ["Software"],
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&face",
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
    id: "o1",
    title: { en: "Frontend Intern", mr: "फ्रंटएंड इंटर्न" },
    type: "Internship",
    company: "TCS Nashik",
    location: { en: "Nashik, Maharashtra", mr: "नाशिक, महाराष्ट्र" },
    deadline: "2026-04-15",
    mentorId: "m1",
    industry: "Software",
    description: { en: "3-month internship in the Frontend team. Work on production apps.", mr: "Frontend टीममध्ये ३ महिन्यांची इंटर्नशिप. प्रत्यक्ष ॲप्सवर काम." },
    requirements: ["React knowledge", "HTML/CSS proficiency", "Currently studying CS"]
  },
  {
    id: "o2",
    title: { en: "Junior Data Scientist", mr: "ज्युनियर डेटा सायंटिस्ट" },
    type: "Job",
    company: "Persistent Systems",
    location: { en: "Nashik, Maharashtra", mr: "नाशिक, महाराष्ट्र" },
    deadline: "2026-04-30",
    mentorId: "m6",
    industry: "Software",
    description: { en: "Full-time role working on high-performance ML models.", mr: "हाय-परफॉर्मन्स ML मॉडेल्सवर काम करण्यासाठी फुल-टाईम भूमिका." },
    requirements: ["Python expert", "Statistical knowledge", "Graduate in Engineering/Maths"]
  },
  {
    id: "o3",
    title: { en: "Agri-Research Assistant", mr: "कृषी संशोधन सहाय्यक" },
    type: "Internship",
    company: "Sahyadri Farms",
    location: { en: "Nashik, Maharashtra", mr: "नाशिक, महाराष्ट्र" },
    deadline: "2026-05-01",
    mentorId: "m2",
    industry: "Agriculture",
    description: { en: "Field research on sustainable grape farming practices.", mr: "शाश्वत द्राक्ष शेती पद्धतींवर प्रत्यक्ष संशोधन." },
    requirements: ["Agriculture background", "Willingness to travel locally", "Data collection skills"]
  }
];

async function seed() {
  console.log('🚀 Finalizing MentorConnect seeding...');

  const { error: mError } = await supabase
    .from('profiles')
    .upsert(SEED_MENTORS, { onConflict: 'id' })
    .select('id');

  if (mError) {
    console.error('❌ Mentor upsert failed:', mError.message);
  } else {
    console.log('✅ 6 Mentors synchronized.');
  }

  const { error: oError } = await supabase
    .from('opportunities')
    .insert(SEED_OPPORTUNITIES)
    .select('id');

  if (oError) {
    console.error('❌ Opportunity insert failed:', oError.message);
  } else {
    console.log('✅ 3 Opportunities synchronized.');
  }

  console.log('✨ Seed process complete!');
}

seed();
