import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BookOpen, Clock, ArrowRight } from "lucide-react";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import api from "@/lib/api";

type CourseItem = {
  _id: string;
  name: string;
  description: string;
  pricingType: "free" | "paid";
  duration: string;
  mentor?: {
    name?: string;
  };
};

export default function StudentCourses() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
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

    fetchCourses();
  }, []);

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8">
        <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
          <div>
            <h1 className="text-h1 text-foreground">Courses</h1>
            <p className="text-body text-muted-foreground mt-2">
              Explore all courses created by mentors.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-48 rounded-3xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {courses.map((course) => (
                <button
                  key={course._id}
                  onClick={() => navigate(`/courses/${course._id}`)}
                  className="text-left bg-card border border-border rounded-3xl p-6 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                        <BookOpen size={22} />
                      </div>
                      <div>
                        <h2 className="text-h3 font-bold text-foreground">{course.name}</h2>
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

                  <p className="text-body text-muted-foreground mt-4 line-clamp-3">
                    {course.description}
                  </p>

                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center gap-2 text-caption text-muted-foreground">
                      <Clock size={14} />
                      <span>{course.duration}</span>
                    </div>
                    <span className="text-primary font-bold text-caption flex items-center gap-1">
                      View Course <ArrowRight size={14} />
                    </span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-border rounded-3xl bg-muted/20">
              <p className="text-muted-foreground font-medium">No courses available yet</p>
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
}
