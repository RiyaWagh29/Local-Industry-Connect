export type Role = "student" | "mentor" | "admin" | null;

export interface LocalizedString {
  en: string;
  mr: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  industries?: string[];
  skills?: string[];
  goals?: string;
  company?: string;
  experience?: number;
  guidance?: string;
  followers?: number;
  followersCount?: number;
  followingCount?: number;
  communities?: number;
  posts?: number;
  onboarding_completed?: boolean;
  following?: string[];
}

export interface Mentor {
  id: string;
  name: LocalizedString;
  role: LocalizedString;
  company: string;
  industry: string;
  avatar: string;
  bio: LocalizedString;
  skills: string[];
  followers: number;
  averageRating?: number;
  communities: number;
  posts: number;
  experience: number;
  guidance: LocalizedString;
  coverImage?: string;
}

export interface Opportunity {
  id: string;
  title: LocalizedString;
  company: string;
  location: LocalizedString;
  type: string;
  deadline: string;
  description: LocalizedString;
  mentorId?: string;
  mentorName?: LocalizedString;
  industry?: string;
}

export interface SharedResource {
  id: string;
  title: LocalizedString;
  description: LocalizedString;
  type: "pdf" | "link" | "video" | "document";
  url: string;
  sharedBy: LocalizedString;
  sharedDate: LocalizedString;
}

export interface Community {
  id: string;
  name: LocalizedString;
  description: LocalizedString;
  members: number;
  image: string;
  category: string;
  recentActivity?: string;
  mentorId?: string;
  mentorName?: LocalizedString;
  mentorAvatar?: string;
  unread?: number;
}

export interface PersonalMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar: string;
  text: string;
  timestamp: string;
  time: string;
}

export interface Conversation {
  id: string;
  participantName: string;
  participantAvatar: string;
  participantRole: "mentor" | "student";
  messages: PersonalMessage[];
  lastMessage?: string;
  lastTime?: string;
  unread: number;
}

export interface Post {
  id: string;
  authorId?: string;
  authorName: LocalizedString | string;
  authorAvatar: string;
  authorRole?: string;
  isMentor?: boolean;
  content: LocalizedString;
  timestamp: LocalizedString | string;
  likes: number;
  comments: number;
  image?: string;
}

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

export interface Session {
  _id: string;
  student: string | any;
  mentor: string | any;
  start: string;
  end: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  meetingLink?: string;
  notes?: string;
  cancelledBy?: {
    user: string;
    role: string;
  };
  createdAt: string;
}
