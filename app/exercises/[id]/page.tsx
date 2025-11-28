"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Swal from "sweetalert2";
import { useTheme } from "@/contexts/ThemeContext";
import ExerciseFlipCard from "@/components/ExerciseFlipCard";
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
  createdAt?: string;
  updatedAt?: string;
}

export default function ExerciseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { theme } = useTheme();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completedToday, setCompletedToday] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        const resolvedParams = await params;
        const response = await fetch(`/api/exercises/${resolvedParams.id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          setExercise(data);
        } else {
          setError(data.message || "Failed to load exercise");
        }
      } catch (err) {
        setError("Network error. Please check your connection.");
        console.error("Exercise fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExercise();
  }, [params]);

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

  const getTypeBgColor = (type: string) => {
    switch (type) {
      case "core":
        return "bg-primary/10";
      case "lowerbody":
        return "bg-secondary/10";
      case "cardio":
        return "bg-warning/10";
      case "upperbody":
        return "bg-success/10";
      default:
        return "bg-primary/10";
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

  const handleStartWorkout = async () => {
    const isDark = theme === "dark";

    const result = await Swal.fire({
      title:
        '<i class="fas fa-play-circle" style="color: #38b000;"></i> Start Workout?',
      text: "Ready to begin this exercise?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#38b000",
      cancelButtonColor: "#424242",
      confirmButtonText: '<i class="fas fa-play"></i> Let\'s Go!',
      cancelButtonText: "Not Yet",
      background: isDark ? "#1e1e1e" : "#f8f9fa",
      color: isDark ? "#eaeaea" : "#212529",
      customClass: {
        popup: isDark ? "swal2-dark" : "swal2-light",
      },
    });

    if (result.isConfirmed) {
      await Swal.fire({
        title: '<i class="fas fa-fire" style="color: #ff6b35;"></i> Go Time!',
        text: "Give it your all! 💪",
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

  const handleMarkComplete = async () => {
    if (!exercise) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const isDark = theme === "dark";

    const result = await Swal.fire({
      title:
        '<i class="fas fa-check-circle" style="color: #38b000;"></i> Mark Complete?',
      text: `Did you finish ${exercise.name}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#38b000",
      cancelButtonColor: "#424242",
      confirmButtonText: '<i class="fas fa-check"></i> Yes, Done!',
      cancelButtonText: "Not Yet",
      background: isDark ? "#1e1e1e" : "#f8f9fa",
      color: isDark ? "#eaeaea" : "#212529",
      customClass: {
        popup: isDark ? "swal2-dark" : "swal2-light",
      },
    });

    if (result.isConfirmed) {
      setCompleting(true);
      try {
        const response = await fetch(
          `/api/exercises/${exercise._id}/complete`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const data = await response.json();

        if (response.ok) {
          setCompletedToday(true);
          await Swal.fire({
            title:
              '<i class="fas fa-trophy" style="color: #ff6b35;"></i> Awesome!',
            html: `<p>${data.message}</p><p style="margin-top: 10px; font-size: 14px; opacity: 0.8;">Your daily challenge progress has been updated!</p>`,
            icon: "success",
            timer: 3000,
            showConfirmButton: false,
            background: isDark ? "#1e1e1e" : "#f8f9fa",
            color: isDark ? "#eaeaea" : "#212529",
            customClass: {
              popup: isDark ? "swal2-dark" : "swal2-light",
            },
          });
        } else {
          await Swal.fire({
            title: "Oops!",
            text: data.message || "Failed to mark complete",
            icon: "info",
            background: isDark ? "#1e1e1e" : "#f8f9fa",
            color: isDark ? "#eaeaea" : "#212529",
            customClass: {
              popup: isDark ? "swal2-dark" : "swal2-light",
            },
          });
          if (data.message?.includes("already completed")) {
            setCompletedToday(true);
          }
        }
      } catch (error) {
        console.error("Error completing exercise:", error);
        await Swal.fire({
          title: "Error",
          text: "Network error. Please try again.",
          icon: "error",
          background: isDark ? "#1e1e1e" : "#f8f9fa",
          color: isDark ? "#eaeaea" : "#212529",
        });
      } finally {
        setCompleting(false);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-circle-notch fa-spin text-primary text-5xl mb-4"></i>
          <p className="text-foreground/70 text-lg">Loading exercise...</p>
        </div>
      </div>
    );
  }

  if (error || !exercise) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-background border border-neutral rounded-2xl p-8">
            <i className="fas fa-exclamation-triangle text-warning text-5xl mb-4"></i>
            <h2 className="text-2xl font-bold text-foreground mb-4">
              {error ? "Error Loading Exercise" : "Exercise Not Found"}
            </h2>
            <p className="text-foreground/70 mb-6">
              {error || "The exercise you're looking for doesn't exist."}
            </p>
            <Link
              href="/exercises"
              className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300"
            >
              <i className="fas fa-arrow-left"></i>
              Back to Exercises
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/exercises" className="inline-block mb-4">
            <i className="fas fa-arrow-left text-foreground/70 hover:text-primary transition-colors mr-2"></i>
            <span className="text-foreground/70 hover:text-primary transition-colors">
              Back to Exercises
            </span>
          </Link>
        </div>

        {/* Exercise Card */}
        <div className="bg-background border border-neutral rounded-2xl shadow-xl overflow-hidden">
          {/* Exercise Header */}
          <div
            className={`${getTypeBgColor(
              exercise.type
            )} p-8 border-b border-neutral`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-4xl font-bold text-foreground mb-4">
                  {exercise.name}
                </h1>
                <div className="flex flex-wrap gap-3">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-background border border-neutral">
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
                <div
                  className={`w-20 h-20 rounded-full flex items-center justify-center border-4 border-background ${getTypeBgColor(
                    exercise.type
                  )}`}
                >
                  <i
                    className={`fas ${getTypeIcon(
                      exercise.type
                    )} ${getTypeColor(exercise.type)} text-3xl`}
                  ></i>
                </div>
              </div>
            </div>
          </div>

          {/* Exercise Details */}
          <div className="p-8">
            {/* Duration or Reps - Larger Display */}
            <div className="mb-8">
              {exercise.duration ? (
                <div className="flex items-center justify-center gap-4 bg-secondary/10 p-8 rounded-2xl">
                  <i className="fas fa-clock text-secondary text-5xl"></i>
                  <div className="text-center">
                    <p className="text-foreground/70 text-lg mb-2">Duration</p>
                    <p className="text-5xl font-bold text-foreground">
                      {exercise.duration}
                      <span className="text-2xl text-foreground/70 ml-2">
                        seconds
                      </span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-4 bg-success/10 p-8 rounded-2xl">
                  <i className="fas fa-redo text-success text-5xl"></i>
                  <div className="text-center">
                    <p className="text-foreground/70 text-lg mb-2">
                      Repetitions
                    </p>
                    <p className="text-5xl font-bold text-foreground">
                      {exercise.reps}
                      <span className="text-2xl text-foreground/70 ml-2">
                        reps
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Description and Flip Card - Desktop: Side by side, Mobile: Stacked */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Description Section */}
              <div className="space-y-6">
                {exercise.description && (
                  <div>
                    <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                      <i className="fas fa-info-circle text-primary"></i>
                      About This Exercise
                    </h2>
                    <p className="text-foreground/70 leading-relaxed text-lg">
                      {exercise.description}
                    </p>
                  </div>
                )}

                {/* Exercise Stats */}
                <div className="bg-background border border-neutral rounded-xl p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4">
                    Exercise Details
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <p className="text-foreground/70 text-sm mb-1">Type</p>
                      <p className="text-foreground font-semibold capitalize flex items-center gap-2">
                        <i
                          className={`fas ${getTypeIcon(
                            exercise.type
                          )} ${getTypeColor(exercise.type)}`}
                        ></i>
                        {exercise.type}
                      </p>
                    </div>
                    <div>
                      <p className="text-foreground/70 text-sm mb-1">
                        Difficulty
                      </p>
                      <p className="text-foreground font-semibold capitalize flex items-center gap-2">
                        <i className="fas fa-signal text-warning"></i>
                        {exercise.difficulty}
                      </p>
                    </div>
                    {exercise.duration && (
                      <div>
                        <p className="text-foreground/70 text-sm mb-1">
                          Duration
                        </p>
                        <p className="text-foreground font-semibold">
                          {exercise.duration} seconds
                        </p>
                      </div>
                    )}
                    {exercise.reps && (
                      <div>
                        <p className="text-foreground/70 text-sm mb-1">Reps</p>
                        <p className="text-foreground font-semibold">
                          {exercise.reps} repetitions
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Flip Card for Demonstration */}
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <i className="fas fa-image text-primary"></i>
                  How to Perform
                </h2>
                <ExerciseFlipCard
                  name={exercise.name}
                  description={exercise.description}
                  type={exercise.type}
                  difficulty={exercise.difficulty}
                  demonstration={exercise.demonstration}
                  duration={exercise.duration}
                  reps={exercise.reps}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-neutral">
              {isLoggedIn ? (
                completedToday ? (
                  <div className="flex-1 bg-success/20 text-success px-8 py-4 rounded-lg font-semibold flex items-center justify-center gap-2 text-lg border-2 border-success">
                    <i className="fas fa-check-circle text-2xl"></i>
                    Completed Today!
                  </div>
                ) : (
                  <button
                    onClick={handleMarkComplete}
                    disabled={completing}
                    className="flex-1 bg-success text-white px-8 py-4 rounded-lg font-semibold hover:bg-success/90 transition-all duration-300 hover:shadow-lg active:scale-95 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {completing ? (
                      <>
                        <i className="fas fa-circle-notch fa-spin text-2xl"></i>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-check-circle text-2xl"></i>
                        Mark Complete
                      </>
                    )}
                  </button>
                )
              ) : (
                <Link
                  href="/login"
                  className="flex-1 bg-success text-white px-8 py-4 rounded-lg font-semibold hover:bg-success/90 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 text-lg"
                >
                  <i className="fas fa-sign-in-alt text-2xl"></i>
                  Login to Track Progress
                </Link>
              )}
              <Link
                href="/daily"
                className="flex-1 bg-primary text-white px-8 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2 text-lg"
              >
                <i className="fas fa-calendar-day"></i>
                View Daily Challenge
              </Link>
            </div>
          </div>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-background border border-neutral rounded-2xl p-6">
          <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <i className="fas fa-lightbulb text-warning"></i>
            Exercise Tips
          </h3>
          <ul className="space-y-2 text-foreground/70">
            <li className="flex items-start gap-3">
              <i className="fas fa-check text-success mt-1"></i>
              <span>Always warm up before starting any exercise</span>
            </li>
            <li className="flex items-start gap-3">
              <i className="fas fa-check text-success mt-1"></i>
              <span>Maintain proper form - quality over quantity is key</span>
            </li>
            <li className="flex items-start gap-3">
              <i className="fas fa-check text-success mt-1"></i>
              <span>Listen to your body and stop if you feel pain</span>
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
