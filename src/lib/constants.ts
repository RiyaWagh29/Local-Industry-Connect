import { Community, LocalizedString } from "./types";

export const industries = [
  "Software",
  "Agriculture",
  "Mechanical",
  "Design",
  "Marketing",
  "Finance",
  "Healthcare",
  "Civil",
];

export const communities: Community[] = [
  {
    id: "c1",
    name: { en: "Software Developers Network", mr: "सॉफ्टवेअर डेव्हलपर्स नेटवर्क" },
    description: { en: "Connect with developers across Nashik.", mr: "नाशिकमधील डेव्हलपर्सशी कनेक्ट व्हा." },
    members: 1240,
    image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=150&h=150&fit=crop",
    category: "Technology",
  },
  {
    id: "c2",
    name: { en: "AgriTech Innovators", mr: "अॅग्रीटेक इनोव्हेटर्स" },
    description: { en: "Innovating agriculture in Maharashtra.", mr: "महाराष्ट्रातील शेतीमध्ये नावीन्य आणणे." },
    members: 850,
    image: "https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?w=150&h=150&fit=crop",
    category: "Agriculture",
  },
  {
    id: "c3",
    name: { en: "Nashik Startup Ecosystem", mr: "नाशिक स्टार्टअप इकोसिस्टम" },
    description: { en: "Hub for entrepreneurs and founders.", mr: "उद्योजक आणि संस्थापकांसाठी केंद्र." },
    members: 2100,
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=150&h=150&fit=crop",
    category: "Business",
  },
];

export const chatMessages: any[] = [
  { 
    id: "c1", 
    senderId: "m1", 
    senderName: { en: "Rahul Deshmukh", mr: "राहुल देशमुख" }, 
    senderAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face", 
    isMentor: true, 
    text: { en: "Hello everyone! Welcome to today's session 🙏", mr: "सर्वांना नमस्कार! आजच्या session ला स्वागत आहे 🙏" }, 
    timestamp: "2026-03-29T10:00:00", 
    time: { en: "10:00 AM", mr: "सकाळी 10:00" } 
  },
];

export const posts: any[] = [
  { 
    id: "1", 
    authorName: { en: "Rahul Deshmukh", mr: "राहुल देशमुख" }, 
    authorAvatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face", 
    isMentor: true, 
    timestamp: { en: "2 hours ago", mr: "2 तासांपूर्वी" }, 
    content: { 
      en: "Posted a new internship opportunity for Frontend developers! Check Opportunities tab. 🚀", 
      mr: "Frontend developers साठी नवीन internship opportunity टाकली आहे! Opportunities tab बघा. 🚀" 
    }, 
    likes: 24, 
    comments: 8 
  },
];
