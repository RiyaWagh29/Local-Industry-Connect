import { useState } from "react";
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

const [communities, setCommunities] = useState([]);

useEffect(() => {
  fetchCommunities(); // or keep empty for now
}, []);

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
