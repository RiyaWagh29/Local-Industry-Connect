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
  }
];

async function runSeed() {
  console.log('🚀 Final Seeding Attempt (Minimal)...');
  
  // Try mentors
  for (const mentor of SEED_MENTORS) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ id: mentor.id, name: mentor.name }, { onConflict: 'id' })
      .select('id');
      
    if (error) {
      console.error(`❌ Mentor ${mentor.id} failed:`, error.message);
    } else {
      console.log(`✅ Mentor ${mentor.id} synchronized.`);
    }
  }
}

runSeed();
