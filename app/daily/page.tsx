"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { useTheme } from "@/contexts/ThemeContext";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface Exercise {
  _id: string;
  name: string;
  description?: string;
  type: "core" | "lowerbody" | "cardio" | "upperbody";
  difficulty: "easy" | "medium" | "hard";
  demonstration?: string;
  duration?: number;
  reps?: number;
}

interface DailyExercise {
  _id: string;
  userId: string;
  exerciseId: Exercise;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export default function DailyPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [daily, setDaily] = useState<DailyExercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDaily = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch("/api/daily", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          setDaily(data);
        } else if (response.status === 401) {
          localStorage.removeItem("token");
          router.push("/login");
        } else {
          setError(data.message || "Failed to load daily exercise");
        }
      } catch (err) {
        setError("Network error. Please check your connection.");
        console.error("Daily fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDaily();
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

  const handleMarkComplete = async () => {
    const isDark = theme === "dark";

    const result = await Swal.fire({
      title:
        '<i class="fas fa-check-circle" style="color: #38b000;"></i> Complete Workout?',
      text: "Mark today's workout as complete?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#38b000",
      cancelButtonColor: "#424242",
      confirmButtonText: '<i class="fas fa-check"></i> Yes, Complete!',
      cancelButtonText: "Cancel",
      background: isDark ? "#1e1e1e" : "#f8f9fa",
      color: isDark ? "#eaeaea" : "#212529",
      customClass: {
        popup: isDark ? "swal2-dark" : "swal2-light",
      },
    });

    if (result.isConfirmed) {
      // TODO: Implement progress tracking API
      await Swal.fire({
        title:
          '<i class="fas fa-trophy" style="color: #38b000;"></i> Great Job!',
        text: "Workout completed successfully! 💪",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
        background: isDark ? "#1e1e1e" : "#f8f9fa",
        color: isDark ? "#eaeaea" : "#212529",
        customClass: {
          popup: isDark ? "swal2-dark" : "swal2-light",
        },
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-circle-notch fa-spin text-primary text-5xl mb-4"></i>
          <p className="text-foreground/70 text-lg">
            Loading your daily workout...
          </p>
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

  if (!daily) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-background border border-neutral rounded-2xl p-8">
            <i className="fas fa-calendar-times text-foreground/50 text-5xl mb-4"></i>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              No Daily Exercise
            </h2>
            <p className="text-foreground/70 mb-6">
              No exercise available for today.
            </p>
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

  const { exerciseId: exercise } = daily;

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <i className="fas fa-arrow-left text-foreground/70 hover:text-primary transition-colors mr-2"></i>
            <span className="text-foreground/70 hover:text-primary transition-colors">
              Back to Home
            </span>
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            <i className="fas fa-calendar-day text-primary mr-3"></i>
            Today's Workout
          </h1>
          <p className="text-foreground/70">
            {new Date(daily.date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Exercise Card */}
        <div className="bg-background border border-neutral rounded-2xl shadow-xl overflow-hidden">
          {/* Exercise Header */}
          <div className="bg-primary/10 p-6 border-b border-neutral">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-bold text-foreground mb-3">
                  {exercise.name}
                </h2>
                <div className="flex flex-wrap gap-3">
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-neutral`}
                  >
                    <i
                      className={`fas ${getTypeIcon(
                        exercise.type
                      )} ${getTypeColor(exercise.type)}`}
                    ></i>
                    <span className="text-foreground font-medium capitalize">
                      {exercise.type}
                    </span>
                  </span>
                  <span
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${getDifficultyColor(
                      exercise.difficulty
                    )}`}
                  >
                    <i className="fas fa-signal"></i>
                    <span className="font-medium capitalize">
                      {exercise.difficulty}
                    </span>
                  </span>
                </div>
              </div>
              <div className="ml-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <i
                    className={`fas ${getTypeIcon(
                      exercise.type
                    )} text-white text-2xl`}
                  ></i>
                </div>
              </div>
            </div>
          </div>

          {/* Exercise Details */}
          <div className="p-8">
            {/* Duration or Reps */}
            <div className="mb-8">
              {exercise.duration ? (
                <div className="flex items-center gap-3 bg-secondary/10 p-6 rounded-xl">
                  <i className="fas fa-clock text-secondary text-3xl"></i>
                  <div>
                    <p className="text-foreground/70 text-sm">Duration</p>
                    <p className="text-3xl font-bold text-foreground">
                      {exercise.duration}{" "}
                      <span className="text-xl text-foreground/70">
                        seconds
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 bg-success/10 p-6 rounded-xl">
                  <i className="fas fa-redo text-success text-3xl"></i>
                  <div>
                    <p className="text-foreground/70 text-sm">Repetitions</p>
                    <p className="text-3xl font-bold text-foreground">
                      {exercise.reps}{" "}
                      <span className="text-xl text-foreground/70">reps</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            {exercise.description && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                  <i className="fas fa-info-circle text-primary"></i>
                  Description
                </h3>
                <p className="text-foreground/70 leading-relaxed text-lg">
                  {exercise.description}
                </p>
              </div>
            )}

            {/* Demonstration Link */}
            {exercise.demonstration && (
              <div className="mb-8">
                <h3 className="text-xl font-bold text-foreground mb-3 flex items-center gap-2">
                  <i className="fas fa-video text-primary"></i>
                  Demonstration
                </h3>
                <a
                  href={exercise.demonstration}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-secondary text-white px-6 py-3 rounded-lg font-semibold hover:bg-secondary/90 transition-all duration-300 hover:shadow-lg"
                >
                  <i className="fas fa-play-circle"></i>
                  Watch Tutorial
                  <i className="fas fa-external-link-alt text-sm"></i>
                </a>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-neutral">
              <button
                onClick={handleMarkComplete}
                className="flex-1 bg-success text-white px-6 py-4 rounded-lg font-semibold hover:bg-success/90 transition-all duration-300 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2"
              >
                <i className="fas fa-check-circle text-xl"></i>
                Mark as Complete
              </button>
              <Link
                href="/exercises"
                className="flex-1 bg-background border border-neutral text-foreground px-6 py-4 rounded-lg font-semibold hover:bg-neutral/20 transition-all duration-300 flex items-center justify-center gap-2"
              >
                <i className="fas fa-th-large"></i>
                Browse All Exercises
              </Link>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-background border border-neutral rounded-2xl p-6">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <i className="fas fa-lightbulb text-warning"></i>
            Quick Tips
          </h3>
          <ul className="space-y-2 text-foreground/70">
            <li className="flex items-start gap-3">
              <i className="fas fa-check text-success mt-1"></i>
              <span>Warm up for 5-10 minutes before starting</span>
            </li>
            <li className="flex items-start gap-3">
              <i className="fas fa-check text-success mt-1"></i>
              <span>Focus on proper form over speed</span>
            </li>
            <li className="flex items-start gap-3">
              <i className="fas fa-check text-success mt-1"></i>
              <span>Stay hydrated throughout your workout</span>
            </li>
            <li className="flex items-start gap-3">
              <i className="fas fa-check text-success mt-1"></i>
              <span>Cool down and stretch after finishing</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
