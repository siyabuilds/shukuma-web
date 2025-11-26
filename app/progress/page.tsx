"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface Exercise {
  _id: string;
  name: string;
  type: "core" | "lowerbody" | "cardio" | "upperbody";
  difficulty: "easy" | "medium" | "hard";
  duration?: number;
  reps?: number;
}

interface ProgressEntry {
  _id: string;
  userId: string;
  exerciseId: Exercise;
  date: string;
  completedReps?: number;
  completedSeconds?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ProgressSummary {
  totalCompleted: number;
  streak: number;
}

export default function ProgressPage() {
  const router = useRouter();
  const [progress, setProgress] = useState<ProgressEntry[]>([]);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgress = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // Fetch progress history
        const progressResponse = await fetch("/api/progress", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // Fetch summary stats
        const summaryResponse = await fetch("/api/progress/summary", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const [progressData, summaryData] = await Promise.all([
          progressResponse.json(),
          summaryResponse.json(),
        ]);

        if (progressResponse.ok && summaryResponse.ok) {
          setProgress(progressData);
          setSummary(summaryData);
        } else if (
          progressResponse.status === 401 ||
          summaryResponse.status === 401
        ) {
          localStorage.removeItem("token");
          router.push("/login");
        } else {
          setError(
            progressData.message ||
              summaryData.message ||
              "Failed to load progress"
          );
        }
      } catch (err) {
        setError("Network error. Please check your connection.");
        console.error("Progress fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [router]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "core":
        return "fa-circle-notch";
      case "lowerbody":
        return "fa-shoe-prints";
      case "cardio":
        return "fa-heartbeat";
      case "upperbody":
        return "fa-dumbbell";
      default:
        return "fa-dumbbell";
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "core":
        return "text-primary";
      case "lowerbody":
        return "text-secondary";
      case "cardio":
        return "text-warning";
      case "upperbody":
        return "text-success";
      default:
        return "text-primary";
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-success/20 text-success";
      case "medium":
        return "bg-warning/20 text-warning";
      case "hard":
        return "bg-primary/20 text-primary";
      default:
        return "bg-neutral/20 text-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-circle-notch fa-spin text-primary text-5xl mb-4"></i>
          <p className="text-foreground/70 text-lg">Loading your progress...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-background border border-neutral rounded-2xl p-8">
            <i className="fas fa-exclamation-triangle text-warning text-5xl mb-4"></i>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-foreground/70 mb-6">{error}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300"
            >
              <i className="fas fa-home"></i>
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <i className="fas fa-arrow-left text-foreground/70 hover:text-primary transition-colors mr-2"></i>
            <span className="text-foreground/70 hover:text-primary transition-colors">
              Back to Home
            </span>
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            <i className="fas fa-chart-line text-success mr-3"></i>
            Your Progress
          </h1>
          <p className="text-foreground/70">
            Track your fitness journey and achievements
          </p>
        </div>

        {/* Summary Stats */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Workouts */}
            <div className="bg-background border border-neutral rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                  <i className="fas fa-check-circle text-primary text-2xl"></i>
                </div>
                <div>
                  <p className="text-foreground/70 text-sm mb-1">
                    Total Workouts
                  </p>
                  <p className="text-4xl font-bold text-foreground">
                    {summary.totalCompleted}
                  </p>
                </div>
              </div>
            </div>

            {/* Current Streak */}
            <div className="bg-background border border-neutral rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-warning/10 rounded-full flex items-center justify-center">
                  <i className="fas fa-fire text-warning text-2xl"></i>
                </div>
                <div>
                  <p className="text-foreground/70 text-sm mb-1">
                    Current Streak
                  </p>
                  <p className="text-4xl font-bold text-foreground">
                    {summary.streak}
                    <span className="text-xl text-foreground/70 ml-2">
                      {summary.streak === 1 ? "day" : "days"}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* This Week */}
            <div className="bg-background border border-neutral rounded-2xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
                  <i className="fas fa-calendar-week text-success text-2xl"></i>
                </div>
                <div>
                  <p className="text-foreground/70 text-sm mb-1">This Week</p>
                  <p className="text-4xl font-bold text-foreground">
                    {
                      progress.filter((p) => {
                        const date = new Date(p.date);
                        const now = new Date();
                        const weekAgo = new Date(
                          now.getTime() - 7 * 24 * 60 * 60 * 1000
                        );
                        return date >= weekAgo;
                      }).length
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Progress History */}
        <div className="bg-background border border-neutral rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Workout History
            </h2>
            {progress.length > 0 && (
              <span className="text-foreground/70 text-sm">
                {progress.length}{" "}
                {progress.length === 1 ? "workout" : "workouts"}
              </span>
            )}
          </div>

          {progress.length === 0 ? (
            <div className="text-center py-12">
              <i className="fas fa-clipboard-list text-foreground/30 text-6xl mb-4"></i>
              <h3 className="text-2xl font-bold text-foreground mb-2">
                No Workouts Yet
              </h3>
              <p className="text-foreground/70 mb-6">
                Start tracking your fitness journey today!
              </p>
              <Link
                href="/daily"
                className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300"
              >
                <i className="fas fa-calendar-day"></i>
                View Today's Workout
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {progress.map((entry) => (
                <div
                  key={entry._id}
                  className="bg-background border border-neutral rounded-xl p-5 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className={`w-12 h-12 rounded-full bg-background border-2 border-neutral flex items-center justify-center`}
                        >
                          <i
                            className={`fas ${getTypeIcon(
                              entry.exerciseId.type
                            )} ${getTypeColor(entry.exerciseId.type)} text-xl`}
                          ></i>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-foreground">
                            {entry.exerciseId.name}
                          </h3>
                          <p className="text-foreground/70 text-sm">
                            {formatDate(entry.date)}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3 mb-3">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                            entry.exerciseId.difficulty
                          )}`}
                        >
                          {entry.exerciseId.difficulty.toUpperCase()}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-background border border-neutral text-foreground capitalize">
                          {entry.exerciseId.type}
                        </span>
                      </div>

                      {/* Completed Stats */}
                      <div className="flex flex-wrap gap-4 text-sm">
                        {entry.completedSeconds && (
                          <div className="flex items-center gap-2">
                            <i className="fas fa-clock text-secondary"></i>
                            <span className="text-foreground/70">
                              {entry.completedSeconds} seconds completed
                            </span>
                          </div>
                        )}
                        {entry.completedReps && (
                          <div className="flex items-center gap-2">
                            <i className="fas fa-redo text-success"></i>
                            <span className="text-foreground/70">
                              {entry.completedReps} reps completed
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Notes */}
                      {entry.notes && (
                        <div className="mt-3 p-3 bg-background border border-neutral rounded-lg">
                          <p className="text-foreground/70 text-sm italic">
                            "{entry.notes}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Completion Badge */}
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
                        <i className="fas fa-check text-success text-xl"></i>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Card */}
        {progress.length > 0 && (
          <div className="mt-8 bg-primary/10 border border-primary/20 rounded-2xl p-8 text-center">
            <i className="fas fa-trophy text-primary text-5xl mb-4"></i>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              Keep Up The Great Work!
            </h3>
            <p className="text-foreground/70 mb-6">
              You've completed {summary?.totalCompleted} workouts. Stay
              consistent to reach your goals!
            </p>
            <Link
              href="/daily"
              className="inline-flex items-center gap-2 bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 hover:shadow-lg"
            >
              <i className="fas fa-calendar-day"></i>
              Today's Workout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
