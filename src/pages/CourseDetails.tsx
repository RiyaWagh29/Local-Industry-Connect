import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, BookOpen, Clock } from "lucide-react";
import { ResponsiveLayout } from "@/components/mentor-connect/ResponsiveLayout";
import api from "@/lib/api";

type CourseDetailsData = {
  _id: string;
  name: string;
  description: string;
  pricingType: "free" | "paid";
  duration: string;
  mentor?: {
    name?: string;
  };
};

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<CourseDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) return;
      setIsLoading(true);
      try {
        const res = await api.get(`/courses/${id}`);
        setCourse(res.data?.data || null);
      } catch (error) {
        setCourse(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourse();
  }, [id]);

  return (
    <ResponsiveLayout>
      <div className="min-h-screen bg-background pb-20 lg:pb-8">
        <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          {isLoading ? (
            <div className="h-80 rounded-3xl bg-muted animate-pulse" />
          ) : course ? (
            <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
              <div className="flex items-start justify-between gap-4 flex-col md:flex-row">
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <BookOpen size={26} />
                  </div>
                  <div>
                    <h1 className="text-h1 text-foreground">{course.name}</h1>
                    <p className="text-body text-muted-foreground mt-2">
                      By {course.mentor?.name || "Mentor"}
                    </p>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider ${
                  course.pricingType === "free"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-amber-500/10 text-amber-600"
                }`}>
                  {course.pricingType}
                </span>
              </div>

              <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="rounded-2xl border border-border bg-muted/20 p-5">
                  <p className="text-caption font-bold text-muted-foreground uppercase tracking-wider">Duration</p>
                  <div className="flex items-center gap-2 mt-2 text-foreground font-bold">
                    <Clock size={16} />
                    <span>{course.duration}</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-border bg-muted/20 p-5">
                  <p className="text-caption font-bold text-muted-foreground uppercase tracking-wider">Pricing</p>
                  <p className="text-foreground font-bold mt-2 capitalize">{course.pricingType}</p>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-h3 font-bold text-foreground">Course Description</h2>
                <p className="text-body text-muted-foreground leading-7 mt-3 whitespace-pre-line">
                  {course.description}
                </p>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center border border-dashed border-border rounded-3xl bg-muted/20">
              <p className="text-muted-foreground font-medium">Course not found</p>
            </div>
          )}
        </div>
      </div>
    </ResponsiveLayout>
  );
}
