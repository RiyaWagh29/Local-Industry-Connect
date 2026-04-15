import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, Award, MessageSquare, Star, 
  ChevronRight, Check, Info, UserPlus, Calendar
} from "lucide-react";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { useLanguage } from "@/lib/language-context";
import { useAuth } from "@/lib/auth-context";
import { useMessages } from "@/lib/messages-context";
import { useMentors } from "@/lib/mentors-context";
import { Mentor } from "@/lib/types";
import { toast } from "sonner";
import { getText } from "@/lib/getText";
import api from "@/lib/api";
import { getAvatarUrl } from "@/lib/avatar";

export default function PublicMentorProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { startConversation } = useMessages();
  const { getMentorById, fetchMentors } = useMentors();
  const { user, refreshUser } = useAuth();
  
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("about");
  const [following, setFollowing] = useState(false);
  const [showRating, setShowRating] = useState(false);
  const [ratingValue, setRatingValue] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);

  useEffect(() => {
    const fetchMentor = async () => {
      if (!id || id === 'undefined') {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const data = await getMentorById(id);
        setMentor(data);
      } catch (err) {
        console.error("Fetch mentor failed", id, err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMentor();
  }, [id, getMentorById]);

  useEffect(() => {
    if (mentor?.id && user?.following) {
      setFollowing(user.following.includes(mentor.id));
    }
  }, [mentor?.id, user?.following]);

  if (isLoading) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </ResponsiveLayout>
    );
  }

  if (!mentor || !mentor.id) {
    return (
      <ResponsiveLayout>
        <div className="min-h-screen flex flex-col items-center justify-center text-muted-foreground gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Award size={32} />
          </div>
          <p className="font-medium">Mentor not found</p>
          <button onClick={() => navigate("/student/explore")} className="btn-ghost">
            Back to Explore
          </button>
        </div>
      </ResponsiveLayout>
    );
  }

  const name = getText(mentor.name);
  const role = getText(mentor.role);
  const bio = getText(mentor.bio);
  const guidance = getText(mentor.guidance);
  const industry = mentor.industry || "General";
  const mentorAvatar = getAvatarUrl(name, mentor.avatar);

  const handleMessage = async () => {
    if (!mentor?.id) return;
    await startConversation({ 
      id: mentor.id, 
      name: getText(mentor.name), 
      avatar: mentorAvatar,
      role: 'mentor'
    });
    navigate(`/messages/${mentor.id}`);
  };

  const handleSubmitRating = async () => {
    if (!mentor?.id) return;
    if (!following) {
      toast.error("Follow the mentor before rating");
      return;
    }
    if (ratingValue < 1) {
      toast.error("Please select a rating");
      return;
    }
    try {
      setRatingSubmitting(true);
      const res = await api.post(`/users/mentors/${mentor.id}/rate`, { score: ratingValue });
      if (res.data?.success) {
        setMentor(prev => prev ? { ...prev, averageRating: res.data.data?.averageRating ?? prev.averageRating } : prev);
        await fetchMentors();
        toast.success("Thanks for rating!");
        setShowRating(false);
      } else {
        toast.error(res.data?.message || "Rating failed");
      }
    } catch (e: unknown) {
      const message = typeof e === "object" && e !== null && "response" in e
        ? (e as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined;
      toast.error(message || "Rating failed");
    } finally {
      setRatingSubmitting(false);
    }
  };

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8 animate-fade-in">
        {/* Cover Image */}
        <div className="relative h-48 md:h-64 lg:h-72 w-full overflow-hidden">
          <img src={mentor.coverImage || 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&h=300&fit=crop'} alt="" className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          <button 
            onClick={() => navigate(-1)} 
            className="absolute top-6 left-6 w-10 h-10 rounded-xl bg-card/90 backdrop-blur shadow-lg flex items-center justify-center text-foreground hover:bg-primary transition-all"
          >
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* Profile Content */}
        <div className="max-w-4xl mx-auto px-4 -mt-20 relative z-10">
          <div className="bg-card rounded-3xl border border-border shadow-2xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="flex flex-col md:flex-row md:items-end gap-6">
                <div className="relative">
                  <img 
                    src={mentorAvatar} 
                    alt={name} 
                    className="w-32 h-32 rounded-3xl border-4 border-card object-cover shadow-xl" 
                  />
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-500 border-4 border-card rounded-full" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-h1 text-foreground leading-tight">{name}</h1>
                    <Award size={24} className="text-primary" />
                  </div>
                  <p className="text-body font-medium text-muted-foreground">{role}</p>
                  <p className="text-caption font-bold text-primary uppercase tracking-widest">{mentor.company || "Independent"}</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <button 
                  onClick={handleMessage}
                  className="btn-outline border-transparent bg-mentor/10 text-mentor hover:bg-mentor"
                >
                  <MessageSquare size={22} />
                </button>
                <button 
                  onClick={() => setActiveTab("meetings")}
                  className="btn-outline border-transparent bg-primary/10 text-primary hover:bg-primary"
                >
                  <Calendar size={20} />
                  Book Meeting
                </button>
                <button 
                  onClick={() => {
                    if (!following) {
                      toast.error("Follow the mentor before rating");
                      return;
                    }
                    setShowRating(true);
                  }}
                  className={`btn-outline border-transparent ${following ? "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500 hover:text-white" : "bg-muted text-muted-foreground cursor-not-allowed"}`}
                >
                  <Star size={20} />
                  Give Rating
                </button>
              </div>
            </div>

            <div className="flex gap-10 mt-10 pt-8 border-t border-border/50">
              <div className="text-center group cursor-default">
                <span className="block text-h2 text-foreground font-bold">{mentor.followers || 0}</span>
                <p className="text-v-small font-bold text-muted-foreground uppercase">Followers</p>
              </div>
              <div className="text-center group cursor-default">
                <span className="block text-h2 text-foreground font-bold">{mentor.communities || 0}</span>
                <p className="text-v-small font-bold text-muted-foreground uppercase">Communities</p>
              </div>
              <div className="text-center group cursor-default">
                <span className="block text-h2 text-foreground font-bold">{mentor.posts || 0}</span>
                <p className="text-v-small font-bold text-muted-foreground uppercase">Posts</p>
              </div>
            </div>

            <div className="flex gap-2 mt-10 px-1 border-b border-border/50 overflow-x-auto scrollbar-hide">
              {[
                { key: "about", label: t("mentor.profile.tabAbout") || "About" },
                { key: "skills", label: t("mentor.profile.tabSkills") || "Skills" },
                { key: "meetings", label: "Meetings" },
              ].map((tab) => (
                <button 
                  key={tab.key} 
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative px-6 py-3 text-body font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.key 
                      ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-1 after:bg-primary" 
                      : "text-muted-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="py-8 min-h-[300px]">
              {activeTab === "about" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="space-y-4">
                    <h3 className="text-h3 font-bold text-foreground flex items-center gap-2">
                       <Info size={20} /> Biography
                    </h3>
                    <p className="text-body text-foreground leading-relaxed bg-muted/30 p-5 rounded-2xl italic">
                      "{bio || "Expert professional mentor."}"
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-card border border-border p-5 rounded-2xl">
                      <span className="text-caption font-bold text-muted-foreground uppercase">Experience</span>
                      <p className="text-h3 text-foreground font-bold mt-1">{mentor.experience || 0} Years</p>
                    </div>
                    <div className="bg-card border border-border p-5 rounded-2xl">
                      <span className="text-caption font-bold text-muted-foreground uppercase">Industry</span>
                      <p className="text-h3 text-foreground font-bold mt-1">{industry}</p>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <h3 className="text-h3 font-bold text-foreground flex items-center gap-2">
                       <Star size={20} /> Guidance
                    </h3>
                    <p className="text-body text-foreground leading-relaxed bg-primary/5 p-5 rounded-2xl border border-primary/10">
                      {guidance || "Available for career guidance and technical mentorship."}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "skills" && (
                <div className="flex flex-wrap gap-3 animate-fade-in">
                  {(mentor.skills || []).map((s: string) => (
                    <div key={s} className="px-5 py-2.5 rounded-2xl bg-card border border-border text-body font-bold text-foreground shadow-sm flex items-center gap-2">
                      <Check size={16} className="text-primary" />
                      {s}
                    </div>
                  ))}
                </div>
              )}

              {activeTab === "meetings" && (
                <div className="space-y-6 animate-fade-in">
                   <div className="bg-primary/5 p-6 rounded-3xl border border-primary/10 space-y-4">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                            <Calendar size={20} />
                         </div>
                         <div>
                            <h4 className="font-bold text-body">Request a Meeting</h4>
                            <p className="text-caption text-muted-foreground">Select a time to connect with {name}.</p>
                         </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                        <input type="datetime-local" className="bg-card border border-border p-3 rounded-xl text-sm" id="meeting-time" />
                        <button 
                          onClick={async () => {
                            const timeInput = document.getElementById('meeting-time') as HTMLInputElement;
                            if (!timeInput?.value) return toast.error("Please select a time");
                            try {
                              const res = await api.post('/meetings', {
                                mentor_id: mentor.id,
                                date_time: timeInput.value
                              });
                              if (res.data?.success) {
                                toast.success("Meeting requested! Wait for mentor to approve.");
                                timeInput.value = "";
                                setActiveTab("about");
                              } else {
                                toast.error(res.data?.message || "Failed to schedule");
                              }
                            } catch (e) { toast.error("Schedule failed"); }
                          }}
                          className="bg-primary text-primary-foreground font-bold p-3 rounded-xl hover:scale-105 transition-all"
                        >
                          Confirm Request
                        </button>
                      </div>
                   </div>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={async () => {
              if (!mentor?.id) return;
              try {
                const res = await api.post(`/users/mentors/${mentor.id}/follow`);
                if (res.data?.success) {
                  const data = res.data.data;
                  setMentor(prev => prev ? { ...prev, followers: data.followersCount } : prev);
                  await refreshUser();
                  await fetchMentors();
                  toast.success(res.data.message);
                }
              } catch (e) {
                toast.error("Complete your profile or login to follow mentors!");
              }
            }}
            className={`w-full mt-8 py-5 rounded-3xl text-body font-extrabold flex items-center justify-center gap-3 shadow-xl transition-all active:scale-[0.98] ${
              following 
                ? "bg-muted text-foreground" 
                : "bg-white text-primary border-4 border-primary hover:bg-primary hover:text-white"
            }`}
          >
            <UserPlus size={22} />
            {following ? "Following" : "Follow Mentor"}
          </button>
        </div>
      </div>
      {showRating && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl p-6">
            <div className="flex items-center justify-between">
              <h3 className="text-h3 font-bold text-foreground">Rate {name}</h3>
              <button
                onClick={() => setShowRating(false)}
                className="w-9 h-9 rounded-full bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
                aria-label="Close"
              >
                ×
              </button>
            </div>
            <p className="text-body text-muted-foreground mt-2">
              Select a rating from 1 to 5 stars.
            </p>

            <div className="flex items-center justify-center gap-2 my-6">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = hovered ? star <= hovered : star <= ratingValue;
                return (
                  <button
                    key={star}
                    onMouseEnter={() => setHovered(star)}
                    onMouseLeave={() => setHovered(0)}
                    onClick={() => setRatingValue(star)}
                    disabled={ratingSubmitting}
                    className={`p-2 rounded-xl transition-all ${active ? "text-yellow-500" : "text-muted-foreground"} ${ratingSubmitting ? "opacity-50 cursor-not-allowed" : "hover:scale-110"}`}
                  >
                    <Star size={28} className={active ? "fill-yellow-500" : ""} />
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowRating(false)}
                className="flex-1 py-3 rounded-2xl border border-border text-muted-foreground font-bold hover:bg-muted/50 transition-all"
                disabled={ratingSubmitting}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitRating}
                className="flex-1 py-3 rounded-2xl bg-primary text-primary-foreground font-bold hover:brightness-110 transition-all"
                disabled={ratingSubmitting}
              >
                {ratingSubmitting ? "Submitting..." : "Submit Rating"}
              </button>
            </div>
          </div>
        </div>
      )}
    </ResponsiveLayout>
  );
}
