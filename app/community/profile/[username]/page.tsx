"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showAlert } from "@/utils/swal";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface ProfileUser {
  _id: string;
  username: string;
  email: string;
}

interface Friend {
  _id: string;
  username: string;
}

interface ProfileData {
  user: ProfileUser;
  friends: Friend[];
  friendCount: number;
  exercisesCompleted: number;
  currentStreak: number;
  completedChallenges: number;
  friendRequestStatus:
    | "none"
    | "pending"
    | "accepted"
    | "can_request"
    | "can_accept"
    | "self";
}

export default function ProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestPending, setRequestPending] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params;
      setUsername(resolvedParams.username);
    };
    unwrapParams();
  }, [params]);

  useEffect(() => {
    if (username) {
      fetchProfile();
    }
  }, [username]);

  const fetchProfile = async () => {
    if (!username) return;

    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`/api/community/profile/${username}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        setProfile(data);
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        setError(data.message || "Failed to load profile");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
      console.error("Profile fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendFriendRequest = async () => {
    if (!profile) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    setRequestPending(true);

    try {
      const response = await fetch("/api/community/friend-request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: profile.user.username }),
      });

      if (response.ok) {
        showAlert("Success", "Friend request sent!", "success");
        fetchProfile();
      } else {
        const data = await response.json();
        showAlert(
          "Error",
          data.message || "Failed to send friend request",
          "error"
        );
      }
    } catch (err) {
      console.error("Failed to send friend request:", err);
      showAlert("Error", "Network error", "error");
    } finally {
      setRequestPending(false);
    }
  };

  const handleAcceptFriendRequest = async (accept: boolean) => {
    if (!profile) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    setRequestPending(true);

    try {
      // First, we need to find the friend request ID
      const friendsResponse = await fetch("/api/community/friends", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!friendsResponse.ok) {
        throw new Error("Failed to fetch friends");
      }

      const friendsData = await friendsResponse.json();
      const friendRequest = friendsData.find(
        (f: any) =>
          f.status === "pending" &&
          f.requester.username === profile.user.username
      );

      if (!friendRequest) {
        throw new Error("Friend request not found");
      }

      const response = await fetch("/api/community/friend-accept", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId: friendRequest._id, accept }),
      });

      if (response.ok) {
        showAlert(
          "Success",
          accept ? "Friend request accepted!" : "Friend request rejected!",
          "success"
        );
        fetchProfile();
      } else {
        const data = await response.json();
        showAlert(
          "Error",
          data.message || "Failed to process friend request",
          "error"
        );
      }
    } catch (err) {
      console.error("Failed to process friend request:", err);
      showAlert("Error", "Network error", "error");
    } finally {
      setRequestPending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <i className="fas fa-circle-notch fa-spin text-primary text-4xl"></i>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-exclamation-circle text-red-500 text-6xl mb-4"></i>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            {error || "Profile not found"}
          </h2>
          <Link
            href="/community"
            className="text-primary hover:underline inline-flex items-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Community
          </Link>
        </div>
      </div>
    );
  }

  const getAchievementBadges = () => {
    const badges = [];

    if (profile.currentStreak >= 7) {
      badges.push({
        icon: "fa-fire",
        color: "text-warning",
        label: "Week Warrior",
        description: "7+ day streak",
      });
    }

    if (profile.currentStreak >= 30) {
      badges.push({
        icon: "fa-medal",
        color: "text-warning",
        label: "Monthly Master",
        description: "30+ day streak",
      });
    }

    if (profile.exercisesCompleted >= 10) {
      badges.push({
        icon: "fa-dumbbell",
        color: "text-primary",
        label: "Getting Started",
        description: "10+ workouts",
      });
    }

    if (profile.exercisesCompleted >= 50) {
      badges.push({
        icon: "fa-trophy",
        color: "text-success",
        label: "Dedicated",
        description: "50+ workouts",
      });
    }

    if (profile.exercisesCompleted >= 100) {
      badges.push({
        icon: "fa-crown",
        color: "text-warning",
        label: "Champion",
        description: "100+ workouts",
      });
    }

    if (profile.friendCount >= 5) {
      badges.push({
        icon: "fa-users",
        color: "text-secondary",
        label: "Social Butterfly",
        description: "5+ friends",
      });
    }

    // Challenge achievements
    if (profile.completedChallenges >= 1) {
      badges.push({
        icon: "fa-handshake",
        color: "text-primary",
        label: "Challenge Accepted",
        description: "First challenge completed",
      });
    }

    if (profile.completedChallenges >= 5) {
      badges.push({
        icon: "fa-bolt",
        color: "text-warning",
        label: "Challenger",
        description: "5+ challenges completed",
      });
    }

    if (profile.completedChallenges >= 10) {
      badges.push({
        icon: "fa-star",
        color: "text-success",
        label: "Challenge Master",
        description: "10+ challenges completed",
      });
    }

    return badges;
  };

  const achievements = getAchievementBadges();

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/community"
          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Community
        </Link>

        {/* Profile Header */}
        <div className="bg-background border border-neutral rounded-2xl p-8 mb-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                <i className="fas fa-user text-primary text-4xl"></i>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-foreground mb-2">
                  {profile.user.username}
                </h1>
                <p className="text-foreground/60 text-lg mb-2">
                  {profile.user.email}
                </p>
                <div className="flex items-center gap-4 text-sm text-foreground/70">
                  <span>
                    <i className="fas fa-user-friends mr-2 text-secondary"></i>
                    {profile.friendCount} Friends
                  </span>
                </div>
              </div>
            </div>

            {/* Friend Request Button */}
            {profile.friendRequestStatus === "can_request" && (
              <button
                onClick={handleSendFriendRequest}
                disabled={requestPending}
                className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {requestPending ? (
                  <>
                    <i className="fas fa-circle-notch fa-spin mr-2"></i>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="fas fa-user-plus mr-2"></i>
                    Add Friend
                  </>
                )}
              </button>
            )}
            {profile.friendRequestStatus === "pending" && (
              <span className="px-6 py-3 bg-warning/10 text-warning rounded-lg font-semibold whitespace-nowrap">
                <i className="fas fa-clock mr-2"></i>
                Request Pending
              </span>
            )}
            {profile.friendRequestStatus === "can_accept" && (
              <div className="flex gap-2">
                <button
                  onClick={() => handleAcceptFriendRequest(true)}
                  disabled={requestPending}
                  className="bg-success text-white px-6 py-3 rounded-lg font-semibold hover:bg-success/90 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  {requestPending ? (
                    <>
                      <i className="fas fa-circle-notch fa-spin mr-2"></i>
                      Processing...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-check mr-2"></i>
                      Accept
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleAcceptFriendRequest(false)}
                  disabled={requestPending}
                  className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 whitespace-nowrap"
                >
                  <i className="fas fa-times mr-2"></i>
                  Reject
                </button>
              </div>
            )}
            {profile.friendRequestStatus === "accepted" && (
              <span className="px-6 py-3 bg-success/10 text-success rounded-lg font-semibold whitespace-nowrap">
                <i className="fas fa-check mr-2"></i>
                Friends
              </span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-background border border-neutral rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <i className="fas fa-dumbbell text-primary text-2xl"></i>
            </div>
            <div className="text-4xl font-bold text-foreground mb-2">
              {profile.exercisesCompleted}
            </div>
            <p className="text-foreground/70">Workouts Completed</p>
          </div>

          <div className="bg-background border border-neutral rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-warning/10 rounded-full mb-4">
              <i className="fas fa-fire text-warning text-2xl"></i>
            </div>
            <div className="text-4xl font-bold text-foreground mb-2">
              {profile.currentStreak}
            </div>
            <p className="text-foreground/70">Day Streak</p>
          </div>

          <div className="bg-background border border-neutral rounded-xl p-6 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-4">
              <i className="fas fa-calendar-check text-success text-2xl"></i>
            </div>
            <div className="text-4xl font-bold text-foreground mb-2">
              {profile.exercisesCompleted
                ? Math.floor(profile.exercisesCompleted / 7)
                : 0}
            </div>
            <p className="text-foreground/70">Weeks Active</p>
          </div>
        </div>

        {/* Achievements Section */}
        <div className="bg-background border border-neutral rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">
            <i className="fas fa-trophy text-warning mr-3"></i>
            Achievements
          </h2>
          {achievements.length === 0 ? (
            <div className="text-center py-8">
              <i className="fas fa-medal text-foreground/20 text-6xl mb-4"></i>
              <p className="text-foreground/60">
                No achievements yet. Keep working out to unlock badges!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className="bg-neutral/20 rounded-xl p-4 text-center border border-neutral hover:shadow-lg transition-all"
                >
                  <i
                    className={`fas ${achievement.icon} ${achievement.color} text-4xl mb-3`}
                  ></i>
                  <h3 className="font-bold text-foreground mb-1">
                    {achievement.label}
                  </h3>
                  <p className="text-sm text-foreground/60">
                    {achievement.description}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Friends Section */}
        {profile.friends.length > 0 && (
          <div className="bg-background border border-neutral rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              <i className="fas fa-user-friends text-secondary mr-3"></i>
              Friends ({profile.friendCount})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {profile.friends.map((friend) => (
                <Link
                  key={friend._id}
                  href={`/community/profile/${friend.username}`}
                  className="bg-neutral/20 rounded-xl p-4 text-center border border-neutral hover:shadow-lg transition-all hover:scale-105"
                >
                  <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                    <i className="fas fa-user text-secondary text-xl"></i>
                  </div>
                  <p className="font-semibold text-foreground hover:text-primary">
                    {friend.username}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
