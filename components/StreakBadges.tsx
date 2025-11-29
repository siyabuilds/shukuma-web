"use client";

import { useEffect, useState } from "react";

interface Badge {
  _id: string;
  milestone: number;
  name: string;
  icon: string;
  description: string;
  earnedAt: string;
  streakCount: number;
}

interface Milestone {
  days: number;
  name: string;
  icon: string;
  description: string;
}

interface ProgressToNext {
  milestone: Milestone;
  current: number;
  target: number;
  percentage: number;
}

interface StreakData {
  currentStreak: number;
  earnedBadges: Badge[];
  nextMilestone: ProgressToNext | null;
  allMilestones: Milestone[];
}

interface StreakBadgesProps {
  onNewBadge?: (badge: Badge) => void;
}

export default function StreakBadges({ onNewBadge }: StreakBadgesProps) {
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllBadges, setShowAllBadges] = useState(false);

  useEffect(() => {
    fetchStreakData();
  }, []);

  const fetchStreakData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("/api/streak/current", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setStreakData(data);
      }
    } catch (err) {
      console.error("Failed to fetch streak data:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-background border border-neutral rounded-2xl p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral/30 rounded w-1/3 mb-4"></div>
          <div className="flex gap-4">
            <div className="h-16 w-16 bg-neutral/30 rounded-full"></div>
            <div className="flex-1">
              <div className="h-4 bg-neutral/30 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-neutral/30 rounded w-3/4"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!streakData) return null;

  const { currentStreak, earnedBadges, nextMilestone, allMilestones } =
    streakData;

  return (
    <div className="space-y-6">
      {/* Current Streak with Progress */}
      <div className="bg-gradient-to-r from-primary/10 to-warning/10 border border-primary/30 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <i className="fas fa-fire text-warning text-2xl"></i>
            Streak Progress
          </h3>
          <div className="text-right">
            <span className="text-4xl font-bold text-primary">
              {currentStreak}
            </span>
            <span className="text-foreground/70 ml-2">
              {currentStreak === 1 ? "day" : "days"}
            </span>
          </div>
        </div>

        {/* Progress to next milestone */}
        {nextMilestone && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm mb-2">
              <span className="text-foreground/70">
                Next:{" "}
                <span className="font-semibold text-foreground">
                  {nextMilestone.milestone.name}
                </span>
              </span>
              <span className="text-foreground/70">
                {nextMilestone.current} / {nextMilestone.target} days
              </span>
            </div>
            <div className="w-full bg-neutral/30 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-warning h-full rounded-full transition-all duration-500"
                style={{ width: `${nextMilestone.percentage}%` }}
              ></div>
            </div>
            <p className="text-xs text-foreground/50 mt-2 text-center">
              {nextMilestone.target - nextMilestone.current} more days to earn{" "}
              <i
                className={`fas ${nextMilestone.milestone.icon} text-warning`}
              ></i>{" "}
              {nextMilestone.milestone.name}!
            </p>
          </div>
        )}

        {!nextMilestone && earnedBadges.length > 0 && (
          <p className="text-sm text-success mt-4 text-center font-semibold">
            <i className="fas fa-party-horn mr-2"></i>You&apos;ve earned all
            available streak badges! Keep going!
          </p>
        )}
      </div>

      {/* Earned Badges */}
      <div className="bg-background border border-neutral rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-foreground flex items-center gap-2">
            <i className="fas fa-medal text-warning"></i>
            Your Badges
          </h3>
          <button
            onClick={() => setShowAllBadges(!showAllBadges)}
            className="text-sm text-primary hover:text-primary/80 font-semibold"
          >
            {showAllBadges ? "Show Earned Only" : "Show All Milestones"}
          </button>
        </div>

        {earnedBadges.length === 0 && !showAllBadges ? (
          <div className="text-center py-8">
            <i className="fas fa-trophy text-foreground/20 text-5xl mb-4"></i>
            <p className="text-foreground/70">
              No badges earned yet. Keep your streak going to earn your first
              badge!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {(showAllBadges ? allMilestones : earnedBadges).map((item) => {
              const isEarned =
                "earnedAt" in item ||
                earnedBadges.some((b) => b.milestone === item.days);
              const badge = earnedBadges.find((b) =>
                "milestone" in item
                  ? b.milestone === item.milestone
                  : b.milestone === item.days
              );
              const milestone =
                "days" in item
                  ? item
                  : allMilestones.find((m) => m.days === item.milestone);

              return (
                <div
                  key={milestone?.days || (item as Badge).milestone}
                  className={`relative p-4 rounded-xl border transition-all ${
                    isEarned
                      ? "bg-gradient-to-br from-warning/10 to-primary/10 border-warning/30"
                      : "bg-neutral/10 border-neutral/30 opacity-50"
                  }`}
                >
                  <div className="text-center">
                    <div
                      className={`w-14 h-14 mx-auto rounded-full flex items-center justify-center ${
                        isEarned ? "bg-warning/20" : "bg-neutral/20"
                      }`}
                    >
                      <i
                        className={`fas ${milestone?.icon} text-3xl ${
                          isEarned ? "text-warning" : "text-foreground/30"
                        }`}
                      ></i>
                    </div>
                    <h4 className="font-bold text-foreground mt-2 text-sm">
                      {milestone?.name}
                    </h4>
                    <p className="text-xs text-foreground/60 mt-1">
                      {milestone?.days} day streak
                    </p>
                    {isEarned && badge && (
                      <p className="text-xs text-success mt-2">
                        Earned {new Date(badge.earnedAt).toLocaleDateString()}
                      </p>
                    )}
                    {!isEarned && (
                      <div className="mt-2">
                        <i className="fas fa-lock text-foreground/30"></i>
                      </div>
                    )}
                  </div>
                  {isEarned && (
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-success rounded-full flex items-center justify-center">
                      <i className="fas fa-check text-white text-xs"></i>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Motivational Message */}
      {currentStreak > 0 && currentStreak < 7 && (
        <div className="bg-secondary/10 border border-secondary/30 rounded-xl p-4 text-center">
          {(() => {
            const messages = [
              "Great job! Keep exercising daily to build your streak and earn badges!",
              "You're on fire! 🔥 Every workout brings you closer to your next badge!",
              "Consistency is key! Keep up the amazing work!",
              "Your dedication is paying off! Don't break the streak now!",
              "One day at a time - you're building something incredible!",
              "The hardest part is showing up, and you're crushing it!",
              "Small steps, big results! Keep moving forward!",
              "Your future self will thank you for not giving up today!",
              "Progress over perfection - you've got this!",
              "Every rep counts, every day matters! Stay strong!",
            ];
            const randomMessage =
              messages[Math.floor(Math.random() * messages.length)];

            return (
              <p className="text-secondary font-semibold">
                <i className="fas fa-fire mr-2"></i>
                {randomMessage}
              </p>
            );
          })()}
        </div>
      )}
    </div>
  );
}

// Notification component for new badges
export function BadgeNotification({
  badge,
  onClose,
}: {
  badge: Badge;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-bounce">
      <div className="bg-gradient-to-r from-warning to-primary text-white rounded-xl p-6 shadow-2xl max-w-sm">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-white/80 hover:text-white"
        >
          <i className="fas fa-times"></i>
        </button>
        <div className="text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-2">
            <i className={`fas ${badge.icon} text-5xl text-white`}></i>
          </div>
          <h3 className="text-xl font-bold mb-1">New Badge Earned!</h3>
          <p className="text-lg font-semibold">{badge.name}</p>
          <p className="text-sm text-white/80 mt-2">{badge.description}</p>
        </div>
      </div>
    </div>
  );
}
