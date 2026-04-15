import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import { BookOpen, Clock, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/lib/api";

type CourseItem = {
  _id: string;
  name: string;
  description: string;
  pricingType: "free" | "paid";
  duration: string;
  mentor?: {
    _id?: string;
    name?: string;
  };
};

export default function MentorCourses() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    pricingType: "free",
    duration: "",
  });

  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/courses");
      setCourses(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (error) {
      setCourses([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await api.post("/courses", form);
      if (res.data?.success) {
        toast.success("Course added successfully");
        setForm({ name: "", description: "", pricingType: "free", duration: "" });
        setShowForm(false);
        fetchCourses();
      } else {
        toast.error(res.data?.message || "Failed to add course");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to add course");
    } finally {
      setSubmitting(false);
    }
  };

  const otherMentorCourses = courses.filter((course) => course.mentor?._id !== user?.id);
  const myCourses = courses.filter((course) => course.mentor?._id === user?.id);

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-h1 text-foreground">Courses</h1>
              <p className="text-body text-muted-foreground mt-2">
                View available courses from other mentors and add your own.
              </p>
            </div>
            <button
              onClick={() => setShowForm((prev) => !prev)}
              className="px-5 py-3 rounded-2xl bg-mentor text-mentor-foreground font-bold flex items-center gap-2"
            >
              <Plus size={18} />
              Add Course
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleCreate} className="bg-card border border-border rounded-3xl p-6 space-y-4">
              <input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Course name"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background"
              />
              <textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Course description"
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-border bg-background resize-none"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  value={form.pricingType}
                  onChange={(e) => setForm((prev) => ({ ...prev, pricingType: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background"
                >
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                </select>
                <input
                  value={form.duration}
                  onChange={(e) => setForm((prev) => ({ ...prev, duration: e.target.value }))}
                  placeholder="Duration"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="px-5 py-3 rounded-2xl bg-primary text-primary-foreground font-bold"
              >
                {submitting ? "Adding..." : "Save Course"}
              </button>
            </form>
          )}

          <section className="space-y-4">
            <h2 className="text-h3 font-bold text-foreground">Your Courses</h2>
            {myCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myCourses.map((course) => (
                  <button
                    key={course._id}
                    onClick={() => navigate(`/courses/${course._id}`)}
                    className="text-left bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-mentor/10 text-mentor flex items-center justify-center">
                        <BookOpen size={22} />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        course.pricingType === "free"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}>
                        {course.pricingType}
                      </span>
                    </div>
                    <h3 className="text-h3 font-bold text-foreground mt-4">{course.name}</h3>
                    <p className="text-body text-muted-foreground mt-2 line-clamp-3">{course.description}</p>
                    <div className="flex items-center gap-2 text-caption text-muted-foreground mt-4">
                      <Clock size={14} />
                      <span>{course.duration}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center border border-dashed border-border rounded-3xl bg-muted/20">
                <p className="text-muted-foreground font-medium">You have not added any courses yet</p>
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-h3 font-bold text-foreground">Courses by Other Mentors</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-48 rounded-3xl bg-muted animate-pulse" />
                ))}
              </div>
            ) : otherMentorCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {otherMentorCourses.map((course) => (
                  <button
                    key={course._id}
                    onClick={() => navigate(`/courses/${course._id}`)}
                    className="text-left bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-3">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                          <BookOpen size={22} />
                        </div>
                        <div>
                          <h3 className="text-h3 font-bold text-foreground">{course.name}</h3>
                          <p className="text-caption text-muted-foreground mt-1">
                            By {course.mentor?.name || "Mentor"}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        course.pricingType === "free"
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-amber-500/10 text-amber-600"
                      }`}>
                        {course.pricingType}
                      </span>
                    </div>
                    <p className="text-body text-muted-foreground mt-4 line-clamp-3">{course.description}</p>
                    <div className="flex items-center gap-2 text-caption text-muted-foreground mt-4">
                      <Clock size={14} />
                      <span>{course.duration}</span>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center border border-dashed border-border rounded-3xl bg-muted/20">
                <p className="text-muted-foreground font-medium">No courses from other mentors yet</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </ResponsiveLayout>
  );
}
