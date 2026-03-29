export type LocalizedString = {
  en: string;
  mr: string;
};

export const industries = [
  "Software", "Agriculture", "Manufacturing", "Healthcare", "Finance", "Education", "Engineering", "Design"
];

export interface Mentor {
  id: string;
  name: LocalizedString;
  role: string | LocalizedString;
  company: string;
  industry: string;
  avatar: string;
  bio: LocalizedString;
  skills: string[];
  followers: number;
  communities: number;
  posts: number;
  experience: number;
  guidance: LocalizedString;
  coverImage: string;
}

export const mentors: Mentor[] = [
  {
    id: "1",
    name: { en: "Rahul Deshmukh", mr: "राहुल देशमुख" },
    role: "Senior Software Engineer",
    company: "TCS Nashik",
    industry: "Software",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    bio: { 
      en: "10+ years of experience in Nashik. Passionate about full-stack development and mentoring.", 
      mr: "नाशिकमधून 10+ वर्षांचा अनुभव. Full-stack development आणि mentoring मध्ये passion." 
    },
    skills: ["React", "Node.js", "Python", "System Design", "AWS"],
    followers: 1240,
    communities: 2,
    posts: 45,
    experience: 12,
    guidance: { 
      en: "Career guidance, code reviews, interview prep, and technical mentorship.", 
      mr: "करिअर मार्गदर्शन, कोड review, इंटरव्ह्यू तयारी, आणि technical mentorship." 
    },
    coverImage: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=300&fit=crop",
  },
  {
    id: "2",
    name: { en: "Sandeep Patil", mr: "संदीप पाटील" },
    role: "Farm Operations Director",
    company: "Sahyadri Farms, Nashik",
    industry: "Agriculture",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    bio: { 
      en: "Sustainable farming initiatives for farmers in Nashik. Grapes, onions, and agritech.", 
      mr: "नाशिक जिल्ह्यातील शेतकऱ्यांसाठी शाश्वत शेती उपक्रम. द्राक्ष, कांदा आणि agritech." 
    },
    skills: ["Agribusiness", "Crop Science", "Supply Chain", "Sustainability"],
    followers: 830,
    communities: 1,
    posts: 32,
    experience: 15,
    guidance: { 
      en: "Agri-entrepreneurship, sustainable farming, and agritech adoption.", 
      mr: "कृषी उद्योजकता, शाश्वत शेती, आणि agritech अवलंबन."
    },
    coverImage: "https://images.unsplash.com/photo-1500937386664-56d1dfef3854?w=800&h=300&fit=crop",
  },
  {
    id: "3",
    name: { en: "Dr. Amina Sheikh", mr: "डॉ. अमिना शेख" },
    role: "Chief Medical Officer",
    company: "Wockhardt Hospital, Nashik",
    industry: "Healthcare",
    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&h=150&fit=crop&crop=face",
    bio: { 
      en: "Promoting healthcare in Nashik and mentoring medical students.", 
      mr: "नाशिकमध्ये आरोग्य सेवेचा प्रसार आणि वैद्यकीय विद्यार्थ्यांना मार्गदर्शन." 
    },
    skills: ["Clinical Research", "Healthcare Management", "Public Health", "Telemedicine"],
    followers: 2100,
    communities: 3,
    posts: 67,
    experience: 20,
    guidance: { 
      en: "Medical career paths, research mentorship, and healthcare innovation.", 
      mr: "वैद्यकीय करिअर मार्ग, संशोधन mentorship, आणि healthcare innovation."
    },
    coverImage: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&h=300&fit=crop",
  },
  {
    id: "4",
    name: { en: "Manish Kulkarni", mr: "मनीष कुलकर्णी" },
    role: "VP of Finance",
    company: "HDFC Bank, Nashik",
    industry: "Finance",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    bio: { 
      en: "Explaining finance and investment banking to students.", 
      mr: "विद्यार्थ्यांना finance आणि investment banking समजावून सांगतो." 
    },
    skills: ["Financial Analysis", "Investment Banking", "Risk Management", "Fintech"],
    followers: 960,
    communities: 1,
    posts: 28,
    experience: 14,
    guidance: { 
      en: "Finance career advice, CA/CFA prep, and fintech opportunities.", 
      mr: "Finance करिअर सल्ला, CA/CFA तयारी, आणि fintech संधी."
    },
    coverImage: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=300&fit=crop",
  },
  {
    id: "5",
    name: { en: "Priya Joshi", mr: "प्रिया जोशी" },
    role: "Product Design Lead",
    company: "Infosys Pune",
    industry: "Design",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    bio: { 
      en: "9 years of experience in UX/UI design. Mentoring new designers.", 
      mr: "UX/UI डिझाइन मध्ये 9 वर्षांचा अनुभव. नवीन designers ला मार्गदर्शन." 
    },
    skills: ["UI/UX Design", "Figma", "Design Systems", "User Research", "Prototyping"],
    followers: 1800,
    communities: 2,
    posts: 52,
    experience: 9,
    guidance: { 
      en: "Portfolio reviews, design thinking, and entering tech design.", 
      mr: "Portfolio reviews, design thinking, आणि tech design मध्ये प्रवेश."
    },
    coverImage: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&h=300&fit=crop",
  },
  {
    id: "6",
    name: { en: "Amit Bhosale", mr: "अमित भोसले" },
    role: "ML Engineer",
    company: "Persistent Systems, Nashik",
    industry: "Software",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    bio: { 
      en: "Building AI systems. Love to teach machine learning.", 
      mr: "AI systems बनवतो. Machine learning शिकवायला आवडतं." 
    },
    skills: ["Machine Learning", "Python", "TensorFlow", "NLP", "Data Science"],
    followers: 3200,
    communities: 2,
    posts: 89,
    experience: 8,
    guidance: { 
      en: "AI/ML career paths, research papers, and project mentorship.", 
      mr: "AI/ML करिअर मार्ग, research papers, आणि project mentorship."
    },
    coverImage: "https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&h=300&fit=crop",
  },
];

export interface Community {
  id: string;
  name: LocalizedString;
  mentorId: string;
  mentorName: LocalizedString;
  mentorAvatar: string;
  members: number;
  unread: number;
  industry: string;
}

export const communities: Community[] = [
  { id: "1", name: { en: "Nashik Software Engineers", mr: "नाशिक सॉफ्टवेअर इंजिनिअर्स" }, mentorId: "1", mentorName: mentors[0].name, mentorAvatar: mentors[0].avatar, members: 450, unread: 3, industry: "Software" },
  { id: "2", name: { en: "Nashik AgriTech Mandal", mr: "नाशिक ॲग्रीटेक मंडळ" }, mentorId: "2", mentorName: mentors[1].name, mentorAvatar: mentors[1].avatar, members: 210, unread: 0, industry: "Agriculture" },
  { id: "3", name: { en: "Healthcare Leaders Nashik", mr: "हेल्थकेअर लीडर्स नाशिक" }, mentorId: "3", mentorName: mentors[2].name, mentorAvatar: mentors[2].avatar, members: 680, unread: 5, industry: "Healthcare" },
  { id: "4", name: { en: "AI & ML Nashik Community", mr: "AI आणि ML नाशिक कम्युनिटी" }, mentorId: "6", mentorName: mentors[5].name, mentorAvatar: mentors[5].avatar, members: 1200, unread: 12, industry: "Software" },
  { id: "5", name: { en: "Design Circle Nashik", mr: "डिझाइन सर्कल नाशिक" }, mentorId: "5", mentorName: mentors[4].name, mentorAvatar: mentors[4].avatar, members: 520, unread: 1, industry: "Design" },
];

export interface Opportunity {
  id: string;
  title: LocalizedString;
  type: string;
  company: string;
  location: LocalizedString;
  deadline: string;
  mentorName: LocalizedString;
  mentorId: string;
  industry: string;
  description: LocalizedString;
  requirements: string[];
}

export const opportunities: Opportunity[] = [
  { 
    id: "1", 
    title: { en: "Frontend Intern", mr: "फ्रंटएंड इंटर्न" }, 
    type: "Internship", 
    company: "TCS Nashik", 
    location: { en: "Nashik, Maharashtra", mr: "नाशिक, महाराष्ट्र" }, 
    deadline: "2026-04-15", 
    mentorName: mentors[0].name, 
    mentorId: "1", 
    industry: "Software", 
    description: { 
      en: "3-month internship in Frontend team. Work on Google Workspace products.", 
      mr: "Frontend team मध्ये 3 महिन्यांचे internship. Google Workspace products वर काम." 
    }, 
    requirements: ["React/Angular experience", "HTML/CSS proficiency", "Currently studying CS"] 
  },
  { 
    id: "2", 
    title: { en: "Junior Data Scientist", mr: "ज्युनियर डेटा सायंटिस्ट" }, 
    type: "Job", 
    company: "Persistent Systems, Nashik", 
    location: { en: "Nashik, Maharashtra", mr: "नाशिक, महाराष्ट्र" }, 
    deadline: "2026-04-30", 
    mentorName: mentors[5].name, 
    mentorId: "6", 
    industry: "Software", 
    description: { 
      en: "Full-time role working on Large Language Models and data pipelines.", 
      mr: "Large language models आणि data pipelines वर Full-time role." 
    }, 
    requirements: ["MS in CS or related", "Python proficiency", "ML framework experience"] 
  },
  { 
    id: "3", 
    title: { en: "Agricultural Research Assistant", mr: "कृषी संशोधन सहाय्यक" }, 
    type: "Internship", 
    company: "Sahyadri Farms, Nashik", 
    location: { en: "Nashik, Maharashtra", mr: "नाशिक, महाराष्ट्र" }, 
    deadline: "2026-05-01", 
    mentorName: mentors[1].name, 
    mentorId: "2", 
    industry: "Agriculture", 
    description: { 
      en: "Helping with sustainable farming research and field trials.", 
      mr: "शाश्वत शेती संशोधन आणि field trials मध्ये मदत." 
    }, 
    requirements: ["Agriculture or Biology major", "Field work experience"] 
  },
];

export interface Post {
  id: string;
  authorName: LocalizedString;
  authorAvatar: string;
  isMentor: boolean;
  timestamp: LocalizedString;
  content: LocalizedString;
  likes: number;
  comments: number;
}

export const posts: Post[] = [
  { 
    id: "1", 
    authorName: mentors[0].name, 
    authorAvatar: mentors[0].avatar, 
    isMentor: true, 
    timestamp: { en: "2 hours ago", mr: "2 तासांपूर्वी" }, 
    content: { 
      en: "Posted a new internship opportunity for Frontend developers! Check Opportunities tab. 🚀", 
      mr: "Frontend developers साठी नवीन internship opportunity टाकली आहे! Opportunities tab बघा. 🚀" 
    }, 
    likes: 24, 
    comments: 8 
  },
  { 
    id: "2", 
    authorName: { en: "Sumit Gaikwad", mr: "सुमित गायकवाड" }, 
    authorAvatar: "https://images.unsplash.com/photo-1599566150163-29194dcabd9c?w=150&h=150&fit=crop&crop=face", 
    isMentor: false, 
    timestamp: { en: "4 hours ago", mr: "4 तासांपूर्वी" }, 
    content: { 
      en: "Can anyone suggest resources for learning System Design? I have an interview.", 
      mr: "System design शिकण्यासाठी कोणी resources सुचवू शकेल का? माझा interview आहे." 
    }, 
    likes: 15, 
    comments: 12 
  },
];

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: LocalizedString;
  senderAvatar: string;
  isMentor: boolean;
  text: LocalizedString;
  timestamp: string;
  time: LocalizedString;
}

export const chatMessages: ChatMessage[] = [
  { 
    id: "c1", 
    senderId: "1", 
    senderName: mentors[0].name, 
    senderAvatar: mentors[0].avatar, 
    isMentor: true, 
    text: { en: "Hello everyone! Welcome to today's session 🙏", mr: "सर्वांना नमस्कार! आजच्या session ला स्वागत आहे 🙏" }, 
    timestamp: "2026-03-29T10:00:00", 
    time: { en: "10:00 AM", mr: "सकाळी 10:00" } 
  },
];

export interface SharedResource {
  id: string;
  title: LocalizedString;
  type: "pdf" | "link" | "video" | "document";
  url: string;
  sharedBy: LocalizedString;
  sharedDate: LocalizedString;
  description: LocalizedString;
}

export const sharedResources: SharedResource[] = [
  { 
    id: "r1", 
    title: { en: "React Hooks Complete Guide", mr: "React Hooks संपूर्ण मार्गदर्शक" }, 
    type: "pdf", 
    url: "#", 
    sharedBy: mentors[0].name, 
    sharedDate: { en: "25 March 2026", mr: "25 मार्च 2026" }, 
    description: { 
      en: "All concepts of React hooks in one place - useState, useEffect, useCallback, useMemo", 
      mr: "React hooks चे सर्व concepts एकत्र - useState, useEffect, useCallback, useMemo" 
    } 
  },
];
