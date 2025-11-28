"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { showAlert } from "@/utils/swal";
import { useTheme } from "@/contexts/ThemeContext";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface DailyChallenge {
  _id: string;
  userId: string;
  date: string;
  challengeType: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  isCompleted: boolean;
  completedAt?: string;
  exerciseId?: {
    _id: string;
    name: string;
  };
  reward: string;
}

interface ChallengeStats {
  total: number;
  completed: number;
  completionRate: string;
  currentStreak: number;
}

export default function DailyChallengeCard() {
  const router = useRouter();
  const { theme } = useTheme();
  const [challenge, setChallenge] = useState<DailyChallenge | null>(null);
  const [stats, setStats] = useState<ChallengeStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChallenge();
    fetchStats();
  }, []);

  const fetchChallenge = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch("/api/daily-challenge", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setChallenge(data);
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        const errorData = await response.json();
        showAlert(
          "Error",
          errorData.message || "Failed to fetch challenge",
          "error"
        );
      }
    } catch (error) {
      console.error("Error fetching challenge:", error);
      showAlert("Error", "Failed to fetch daily challenge", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("/api/daily-challenge/stats", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    }
  };

  const handleComplete = async () => {
    if (!challenge) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch("/api/daily-challenge/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ challengeId: challenge._id }),
      });

      if (response.ok) {
        const data = await response.json();
        setChallenge(data.challenge);
        showAlert("Challenge Complete!", data.message, "success");
        fetchStats(); // Refresh stats
      } else {
        const errorData = await response.json();
        showAlert(
          "Error",
          errorData.message || "Failed to complete challenge",
          "error"
        );
      }
    } catch (error) {
      console.error("Error completing challenge:", error);
      showAlert("Error", "Failed to complete challenge", "error");
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg h-48"></div>
    );
  }

  if (!challenge) {
    return null;
  }

  const progressPercentage = Math.min(
    (challenge.progress / challenge.target) * 100,
    100
  );

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case "complete_exercises":
        return "fa-bullseye";
      case "specific_exercise":
        return "fa-dumbbell";
      case "variety_challenge":
        return "fa-layer-group";
      case "exercise_streak":
        return "fa-fire";
      default:
        return "fa-star";
    }
  };

  return (
    <div className="space-y-4">
      {/* Challenge Card */}
      <div
        className={`relative overflow-hidden rounded-xl shadow-lg p-6 ${
          challenge.isCompleted
            ? "bg-gradient-to-br from-[#38B000] to-[#2d8a00]"
            : "bg-gradient-to-br from-[#FF6B35] to-[#00B4D8]"
        } text-white`}
      >
        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <i
                    className={`fas ${getChallengeIcon(
                      challenge.challengeType
                    )} text-2xl`}
                  ></i>
                </div>
                <h3 className="text-2xl font-bold">Daily Challenge</h3>
              </div>
              <h4 className="text-xl font-semibold mb-2">{challenge.title}</h4>
              <p className="text-white/90">{challenge.description}</p>
            </div>
            {challenge.isCompleted && (
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <i className="fas fa-check-circle text-3xl"></i>
              </div>
            )}
          </div>

          {challenge.exerciseId && (
            <div className="bg-white/20 rounded-lg p-3 mb-4">
              <p className="text-sm font-semibold">
                <i className="fas fa-dumbbell mr-2"></i>Featured Exercise:
              </p>
              <p className="text-lg">{challenge.exerciseId.name}</p>
            </div>
          )}

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress</span>
              <span className="font-bold">
                {challenge.progress} / {challenge.target}
              </span>
            </div>
            <div className="w-full bg-white/30 rounded-full h-4 overflow-hidden">
              <div
                className="bg-white h-full transition-all duration-500 ease-out flex items-center justify-end pr-2"
                style={{ width: `${progressPercentage}%` }}
              >
                {progressPercentage > 15 && (
                  <span className="text-xs font-bold text-[#FF6B35]">
                    {Math.round(progressPercentage)}%
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Action Button */}
          {!challenge.isCompleted && challenge.progress >= challenge.target && (
            <button
              onClick={handleComplete}
              className="mt-4 w-full bg-white text-[#FF6B35] font-bold py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
            >
              <i className="fas fa-check-circle"></i>
              Mark as Complete
            </button>
          )}

          {challenge.isCompleted && (
            <div className="mt-4 text-center">
              <p className="text-xl font-bold">
                <i className="fas fa-trophy mr-2"></i>
                Great job!
              </p>
              <p className="text-sm text-white/80 mt-1">
                Completed{" "}
                {new Date(challenge.completedAt!).toLocaleTimeString()}
              </p>
            </div>
          )}
        </div>

        {/* Decorative background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>
      </div>

      {/* Stats Card */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-background border border-neutral rounded-lg p-4 shadow">
            <div className="flex items-center gap-2 mb-1">
              <i className="fas fa-calendar-check text-[#00B4D8]"></i>
              <p className="text-sm text-foreground/70">Total</p>
            </div>
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          </div>
          <div className="bg-background border border-neutral rounded-lg p-4 shadow">
            <div className="flex items-center gap-2 mb-1">
              <i className="fas fa-check-double text-success"></i>
              <p className="text-sm text-foreground/70">Completed</p>
            </div>
            <p className="text-2xl font-bold text-success">{stats.completed}</p>
          </div>
          <div className="bg-background border border-neutral rounded-lg p-4 shadow">
            <div className="flex items-center gap-2 mb-1">
              <i className="fas fa-chart-line text-[#00B4D8]"></i>
              <p className="text-sm text-foreground/70">Success Rate</p>
            </div>
            <p className="text-2xl font-bold text-[#00B4D8]">
              {stats.completionRate}%
            </p>
          </div>
          <div className="bg-background border border-neutral rounded-lg p-4 shadow">
            <div className="flex items-center gap-2 mb-1">
              <i className="fas fa-fire text-[#FF6B35]"></i>
              <p className="text-sm text-foreground/70">Streak</p>
            </div>
            <p className="text-2xl font-bold text-[#FF6B35]">
              {stats.currentStreak}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
