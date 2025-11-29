"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showAlert } from "@/utils/swal";
import WorkoutChallengeCard from "@/components/WorkoutChallengeCard";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface User {
  _id: string;
  username: string;
  email: string;
}

interface Comment {
  _id: string;
  userId: User;
  content: string;
  createdAt: string;
}

interface Post {
  _id: string;
  userId: User;
  content: string;
  type?: string;
  meta?: any;
  likes: string[];
  comments: Comment[];
  createdAt: string;
  updatedAt: string;
}

interface FriendRequest {
  _id: string;
  requester: User;
  recipient: User;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

interface Exercise {
  _id: string;
  name: string;
  description?: string;
  category?: string;
  type?: string;
  difficulty?: string;
  duration?: number;
  reps?: number;
}

interface ExerciseSnapshot {
  name: string;
  type?: string;
  difficulty?: string;
  duration?: number;
  reps?: number;
  description?: string;
}

interface Challenge {
  _id: string;
  fromUser: User;
  toUser: User;
  exerciseId?: Exercise;
  exerciseSnapshot?: ExerciseSnapshot;
  message?: string;
  status: "pending" | "accepted" | "declined" | "completed";
  isComplete: boolean;
  isWorkoutAssignment?: boolean;
  durationDays: number;
  acceptedAt?: string;
  completedAt?: string;
  deadline?: string;
  createdAt: string;
}

export default function CommunityPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"feed" | "friends" | "challenges">(
    "feed"
  );
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  // Feed state
  const [posts, setPosts] = useState<Post[]>([]);
  const [feedLoading, setFeedLoading] = useState(true);
  const [newPostContent, setNewPostContent] = useState("");

  // Comment state
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );
  const [commentInputs, setCommentInputs] = useState<{
    [postId: string]: string;
  }>({});
  const [submittingComment, setSubmittingComment] = useState<string | null>(
    null
  );

  // Friends state
  const [friends, setFriends] = useState<FriendRequest[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [friendUsername, setFriendUsername] = useState("");

  // Challenges state
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengesLoading, setChallengesLoading] = useState(true);
  const [activeChallenge, setActiveChallenge] = useState<Challenge | null>(
    null
  );

  // Challenge form state
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedFriend, setSelectedFriend] = useState<string>("");
  const [selectedExercise, setSelectedExercise] = useState<string>("");
  const [challengeDays, setChallengeDays] = useState<number>(7);
  const [challengeMessage, setChallengeMessage] = useState<string>("");
  const [isSendingChallenge, setIsSendingChallenge] = useState(false);
  const [friendDropdownOpen, setFriendDropdownOpen] = useState(false);
  const [friendsForChallenge, setFriendsForChallenge] = useState<User[]>([]);
  const [loadingFriendsDropdown, setLoadingFriendsDropdown] = useState(false);
  const friendDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        friendDropdownRef.current &&
        !friendDropdownRef.current.contains(event.target as Node)
      ) {
        setFriendDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Decode token to get current user info
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(payload.userId || payload._id);
      setCurrentUsername(payload.username);
    } catch (err) {
      console.error("Failed to decode token:", err);
    }

    fetchFeed();
    fetchFriends();
    fetchChallenges();
    fetchExercises();
    fetchActiveChallenge();
  }, [router]);

  const fetchFeed = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("/api/community/feed", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data);
      }
    } catch (err) {
      console.error("Failed to fetch feed:", err);
    } finally {
      setFeedLoading(false);
    }
  };

  const fetchFriends = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("/api/community/friends", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setFriends(data);
      }
    } catch (err) {
      console.error("Failed to fetch friends:", err);
    } finally {
      setFriendsLoading(false);
    }
  };

  const fetchChallenges = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("/api/community/challenges", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setChallenges(data);
      }
    } catch (err) {
      console.error("Failed to fetch challenges:", err);
    } finally {
      setChallengesLoading(false);
    }
  };

  const fetchExercises = async () => {
    try {
      const response = await fetch("/api/exercises");
      if (response.ok) {
        const data = await response.json();
        setExercises(data);
      }
    } catch (err) {
      console.error("Failed to fetch exercises:", err);
    }
  };

  const fetchActiveChallenge = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("/api/community/active-challenge", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setActiveChallenge(data);
      }
    } catch (err) {
      console.error("Failed to fetch active challenge:", err);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      showAlert("Error", "Please enter some content", "error");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("/api/community/share", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: newPostContent, type: "general" }),
      });

      if (response.ok) {
        showAlert("Success", "Post created!", "success");
        setNewPostContent("");
        fetchFeed();
      } else {
        const data = await response.json();
        showAlert("Error", data.message || "Failed to create post", "error");
      }
    } catch (err) {
      console.error("Failed to create post:", err);
      showAlert("Error", "Network error", "error");
    }
  };

  const handleLike = async (postId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`/api/community/like/${postId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchFeed();
      } else {
        const data = await response.json();
        if (data.message !== "Already liked this post") {
          showAlert("Error", data.message || "Failed to like post", "error");
        }
      }
    } catch (err) {
      console.error("Failed to like post:", err);
    }
  };

  const handleUnlike = async (postId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(`/api/community/unlike/${postId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        fetchFeed();
      } else {
        const data = await response.json();
        showAlert("Error", data.message || "Failed to unlike post", "error");
      }
    } catch (err) {
      console.error("Failed to unlike post:", err);
    }
  };

  const toggleComments = (postId: string) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) {
        newSet.delete(postId);
      } else {
        newSet.add(postId);
      }
      return newSet;
    });
  };

  const handleCommentChange = (postId: string, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const handleAddComment = async (postId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const content = commentInputs[postId]?.trim();
    if (!content) {
      showAlert("Error", "Please enter a comment", "error");
      return;
    }

    setSubmittingComment(postId);
    try {
      const response = await fetch(`/api/community/comment/${postId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
        fetchFeed();
      } else {
        const data = await response.json();
        showAlert("Error", data.message || "Failed to add comment", "error");
      }
    } catch (err) {
      console.error("Failed to add comment:", err);
      showAlert("Error", "Network error", "error");
    } finally {
      setSubmittingComment(null);
    }
  };

  const handleDeleteComment = async (postId: string, commentId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch(
        `/api/community/comment/${postId}/${commentId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        fetchFeed();
      } else {
        const data = await response.json();
        showAlert("Error", data.message || "Failed to delete comment", "error");
      }
    } catch (err) {
      console.error("Failed to delete comment:", err);
      showAlert("Error", "Network error", "error");
    }
  };

  const handleSendFriendRequest = async () => {
    if (!friendUsername.trim()) {
      showAlert("Error", "Please enter a username", "error");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("/api/community/friend-request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: friendUsername }),
      });

      if (response.ok) {
        showAlert("Success", "Friend request sent!", "success");
        setFriendUsername("");
        fetchFriends();
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
    }
  };

  const handleFriendRequest = async (requestId: string, accept: boolean) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("/api/community/friend-accept", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ requestId, accept }),
      });

      if (response.ok) {
        showAlert(
          "Success",
          accept ? "Friend request accepted!" : "Friend request rejected!",
          "success"
        );
        fetchFriends();
      } else {
        const data = await response.json();
        showAlert(
          "Error",
          data.message || "Failed to process request",
          "error"
        );
      }
    } catch (err) {
      console.error("Failed to process friend request:", err);
      showAlert("Error", "Network error", "error");
    }
  };

  // Get accepted friends for dropdown
  const getAcceptedFriends = () => {
    if (!currentUserId) return [];
    return friends
      .filter((f) => f.status === "accepted")
      .map((friendship) => {
        const isRequester = friendship.requester._id === currentUserId;
        return isRequester ? friendship.recipient : friendship.requester;
      });
  };

  // Load friends when dropdown is opened
  const handleFriendDropdownOpen = async () => {
    if (friendDropdownOpen) {
      setFriendDropdownOpen(false);
      return;
    }

    setFriendDropdownOpen(true);
    setLoadingFriendsDropdown(true);

    const token = localStorage.getItem("token");
    if (!token) {
      setLoadingFriendsDropdown(false);
      return;
    }

    try {
      const response = await fetch("/api/community/friends", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        // Filter to only accepted friends
        const accepted = data
          .filter((f: FriendRequest) => f.status === "accepted")
          .map((friendship: FriendRequest) => {
            const isRequester = friendship.requester._id === currentUserId;
            return isRequester ? friendship.recipient : friendship.requester;
          });
        setFriendsForChallenge(accepted);
      }
    } catch (err) {
      console.error("Failed to fetch friends for dropdown:", err);
    } finally {
      setLoadingFriendsDropdown(false);
    }
  };

  const selectFriend = (username: string) => {
    setSelectedFriend(username);
    setFriendDropdownOpen(false);
  };

  const handleSendChallenge = async () => {
    if (!selectedFriend) {
      showAlert("Error", "Please select a friend", "error");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) return;

    setIsSendingChallenge(true);
    try {
      const response = await fetch("/api/community/challenge", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          toUsername: selectedFriend,
          exerciseId: selectedExercise || undefined,
          message: challengeMessage || undefined,
          durationDays: challengeDays,
        }),
      });

      if (response.ok) {
        showAlert("Success", "Challenge sent!", "success");
        setSelectedFriend("");
        setSelectedExercise("");
        setChallengeDays(7);
        setChallengeMessage("");
        fetchChallenges();
      } else {
        const data = await response.json();
        showAlert("Error", data.message || "Failed to send challenge", "error");
      }
    } catch (err) {
      console.error("Failed to send challenge:", err);
      showAlert("Error", "Network error", "error");
    } finally {
      setIsSendingChallenge(false);
    }
  };

  const handleRespondToChallenge = async (
    challengeId: string,
    accept: boolean
  ) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("/api/community/challenge-respond", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ challengeId, accept }),
      });

      if (response.ok) {
        showAlert(
          "Success",
          accept ? "Challenge accepted! Good luck!" : "Challenge declined",
          "success"
        );
        fetchChallenges();
        fetchActiveChallenge();
      } else {
        const data = await response.json();
        showAlert(
          "Error",
          data.message || "Failed to respond to challenge",
          "error"
        );
      }
    } catch (err) {
      console.error("Failed to respond to challenge:", err);
      showAlert("Error", "Network error", "error");
    }
  };

  const handleCompleteChallenge = async (challengeId: string) => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const response = await fetch("/api/community/challenge-complete", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ challengeId }),
      });

      if (response.ok) {
        showAlert("Success", "Challenge completed! Great job! 🎉", "success");
        fetchChallenges();
        fetchActiveChallenge();
      } else {
        const data = await response.json();
        showAlert(
          "Error",
          data.message || "Failed to complete challenge",
          "error"
        );
      }
    } catch (err) {
      console.error("Failed to complete challenge:", err);
      showAlert("Error", "Network error", "error");
    }
  };

  const getTimeRemaining = (deadline: string) => {
    const now = new Date().getTime();
    const deadlineTime = new Date(deadline).getTime();
    const diff = deadlineTime - now;

    if (diff <= 0) return { expired: true, text: "Expired" };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) {
      return { expired: false, text: `${days}d ${hours}h remaining` };
    } else if (hours > 0) {
      return { expired: false, text: `${hours}h ${minutes}m remaining` };
    } else {
      return { expired: false, text: `${minutes}m remaining` };
    }
  };

  const getFriendDisplay = (friendship: FriendRequest) => {
    if (!currentUserId) return null;

    const isRequester = friendship.requester._id === currentUserId;
    const friend = isRequester ? friendship.recipient : friendship.requester;

    return {
      friend,
      isRequester,
      isPending: friendship.status === "pending",
      isAccepted: friendship.status === "accepted",
    };
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return "Today";
    if (days === 1) return "Yesterday";
    if (days < 7) return `${days} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Community</h1>
          <p className="text-foreground/70">
            Connect with friends, share progress, and challenge each other
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-neutral mb-8">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab("feed")}
              className={`pb-4 px-2 font-semibold transition-colors ${
                activeTab === "feed"
                  ? "text-primary border-b-2 border-primary"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <i className="fas fa-newspaper mr-2"></i>
              Feed
            </button>
            <button
              onClick={() => setActiveTab("friends")}
              className={`pb-4 px-2 font-semibold transition-colors ${
                activeTab === "friends"
                  ? "text-primary border-b-2 border-primary"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <i className="fas fa-user-friends mr-2"></i>
              Friends
            </button>
            <button
              onClick={() => setActiveTab("challenges")}
              className={`pb-4 px-2 font-semibold transition-colors ${
                activeTab === "challenges"
                  ? "text-primary border-b-2 border-primary"
                  : "text-foreground/60 hover:text-foreground"
              }`}
            >
              <i className="fas fa-trophy mr-2"></i>
              Challenges
            </button>
          </div>
        </div>

        {/* Feed Tab */}
        {activeTab === "feed" && (
          <div className="space-y-6">
            {/* Create Post */}
            <div className="bg-background border border-neutral rounded-xl p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">
                Share Your Progress
              </h3>
              <textarea
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
                placeholder="What's on your mind?"
                className="w-full p-4 border border-neutral rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                rows={3}
              />
              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleCreatePost}
                  className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors"
                >
                  <i className="fas fa-paper-plane mr-2"></i>
                  Post
                </button>
              </div>
            </div>

            {/* Posts Feed */}
            {feedLoading ? (
              <div className="text-center py-12">
                <i className="fas fa-circle-notch fa-spin text-primary text-4xl"></i>
              </div>
            ) : posts.length === 0 ? (
              <div className="text-center py-12 bg-background border border-neutral rounded-xl">
                <i className="fas fa-comments text-foreground/30 text-6xl mb-4"></i>
                <p className="text-foreground/70">
                  No posts yet. Be the first to share!
                </p>
              </div>
            ) : (
              posts.map((post) => {
                const isLiked =
                  currentUserId && post.likes.includes(currentUserId);
                return (
                  <div
                    key={post._id}
                    className="bg-background border border-neutral rounded-xl p-6"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <i className="fas fa-user text-primary text-xl"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Link
                            href={`/community/profile/${post.userId.username}`}
                            className="font-bold text-foreground hover:text-primary"
                          >
                            {post.userId.username}
                          </Link>
                          <span className="text-foreground/50 text-sm">
                            • {formatDate(post.createdAt)}
                          </span>
                        </div>
                        <p className="text-foreground whitespace-pre-wrap mb-4">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-4">
                          <button
                            onClick={() =>
                              isLiked
                                ? handleUnlike(post._id)
                                : handleLike(post._id)
                            }
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                              isLiked
                                ? "bg-red-50 dark:bg-red-500/10 text-red-500 hover:bg-red-100 dark:hover:bg-red-500/20"
                                : "bg-neutral/30 text-foreground/70 hover:bg-neutral/50"
                            }`}
                          >
                            <i
                              className={`${
                                isLiked ? "fas fa-heart" : "far fa-heart"
                              }`}
                            ></i>
                            <span className="font-semibold">
                              {post.likes.length}
                            </span>
                          </button>
                          <button
                            onClick={() => toggleComments(post._id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                              expandedComments.has(post._id)
                                ? "bg-primary/10 text-primary"
                                : "bg-neutral/30 text-foreground/70 hover:bg-neutral/50"
                            }`}
                          >
                            <i className="far fa-comment"></i>
                            <span className="font-semibold">
                              {post.comments?.length || 0}
                            </span>
                          </button>
                        </div>

                        {/* Comments Section */}
                        {expandedComments.has(post._id) && (
                          <div className="mt-4 pt-4 border-t border-neutral">
                            {/* Add Comment Input */}
                            <div className="flex gap-2 mb-4">
                              <input
                                type="text"
                                value={commentInputs[post._id] || ""}
                                onChange={(e) =>
                                  handleCommentChange(post._id, e.target.value)
                                }
                                placeholder="Write a comment..."
                                className="flex-1 px-4 py-2 bg-background border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-foreground text-sm"
                                maxLength={500}
                                onKeyPress={(e) => {
                                  if (e.key === "Enter")
                                    handleAddComment(post._id);
                                }}
                              />
                              <button
                                onClick={() => handleAddComment(post._id)}
                                disabled={submittingComment === post._id}
                                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                              >
                                {submittingComment === post._id ? (
                                  <i className="fas fa-spinner fa-spin"></i>
                                ) : (
                                  <i className="fas fa-paper-plane"></i>
                                )}
                              </button>
                            </div>

                            {/* Comments List */}
                            {post.comments && post.comments.length > 0 ? (
                              <div className="space-y-3 max-h-60 overflow-y-auto">
                                {post.comments.map((comment) => (
                                  <div
                                    key={comment._id}
                                    className="flex items-start gap-3 bg-neutral/20 rounded-lg p-3"
                                  >
                                    <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0">
                                      <i className="fas fa-user text-secondary text-sm"></i>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <Link
                                          href={`/community/profile/${
                                            comment.userId?.username ||
                                            "unknown"
                                          }`}
                                          className="font-semibold text-foreground hover:text-primary text-sm"
                                        >
                                          {comment.userId?.username ||
                                            "Unknown"}
                                        </Link>
                                        <span className="text-foreground/50 text-xs">
                                          {formatDate(comment.createdAt)}
                                        </span>
                                      </div>
                                      <p className="text-foreground/80 text-sm break-words">
                                        {comment.content}
                                      </p>
                                    </div>
                                    {(comment.userId?._id === currentUserId ||
                                      post.userId._id === currentUserId) && (
                                      <button
                                        onClick={() =>
                                          handleDeleteComment(
                                            post._id,
                                            comment._id
                                          )
                                        }
                                        className="text-foreground/40 hover:text-red-500 transition-colors flex-shrink-0"
                                        title="Delete comment"
                                      >
                                        <i className="fas fa-trash-alt text-xs"></i>
                                      </button>
                                    )}
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-foreground/50 text-sm text-center py-2">
                                No comments yet. Be the first to comment!
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Friends Tab */}
        {activeTab === "friends" && (
          <div className="space-y-6">
            {/* Add Friend */}
            <div className="bg-background border border-neutral rounded-xl p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">
                Add New Friend
              </h3>
              <div className="flex gap-4">
                <input
                  type="text"
                  value={friendUsername}
                  onChange={(e) => setFriendUsername(e.target.value)}
                  placeholder="Enter username"
                  className="flex-1 p-3 border border-neutral rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyPress={(e) => {
                    if (e.key === "Enter") handleSendFriendRequest();
                  }}
                />
                <button
                  onClick={handleSendFriendRequest}
                  className="bg-primary text-white px-4 py-4 rounded-lg font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
                >
                  <i className="fas fa-user-plus mx-auto"></i>
                </button>
              </div>
            </div>

            {/* Friends List */}
            {friendsLoading ? (
              <div className="text-center py-12">
                <i className="fas fa-circle-notch fa-spin text-primary text-4xl"></i>
              </div>
            ) : friends.length === 0 ? (
              <div className="text-center py-12 bg-background border border-neutral rounded-xl">
                <i className="fas fa-user-friends text-foreground/30 text-6xl mb-4"></i>
                <p className="text-foreground/70">
                  No friends yet. Add some friends to get started!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friends.map((friendship) => {
                  const display = getFriendDisplay(friendship);
                  if (!display) return null;

                  const { friend, isRequester, isPending, isAccepted } =
                    display;

                  return (
                    <div
                      key={friendship._id}
                      className="bg-background border border-neutral rounded-xl p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center">
                            <i className="fas fa-user text-secondary text-xl"></i>
                          </div>
                          <div>
                            <Link
                              href={`/community/profile/${friend.username}`}
                              className="font-bold text-foreground hover:text-primary block"
                            >
                              {friend.username}
                            </Link>
                            <p className="text-sm text-foreground/60">
                              {friend.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {isAccepted && (
                            <span className="px-4 py-2 bg-success/10 text-success rounded-lg font-semibold">
                              <i className="fas fa-check mr-2"></i>
                              Friends
                            </span>
                          )}
                          {isPending && isRequester && (
                            <span className="px-4 py-2 bg-warning/10 text-warning rounded-lg font-semibold">
                              <i className="fas fa-clock mr-2"></i>
                              Request Pending
                            </span>
                          )}
                          {isPending && !isRequester && (
                            <>
                              <button
                                onClick={() =>
                                  handleFriendRequest(friendship._id, true)
                                }
                                className="px-4 py-2 bg-success text-white rounded-lg font-semibold hover:bg-success/90 transition-colors"
                              >
                                <i className="fas fa-check mr-2"></i>
                                Accept
                              </button>
                              <button
                                onClick={() =>
                                  handleFriendRequest(friendship._id, false)
                                }
                                className="px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
                              >
                                <i className="fas fa-times mr-2"></i>
                                Delete
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Challenges Tab */}
        {activeTab === "challenges" && (
          <div className="space-y-6">
            {/* Active Challenge Banner - Using WorkoutChallengeCard */}
            {activeChallenge && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <i className="fas fa-fire text-primary text-2xl animate-pulse"></i>
                  <h3 className="text-xl font-bold text-foreground">
                    Your Active Challenge
                  </h3>
                </div>
                <WorkoutChallengeCard
                  challenge={activeChallenge}
                  currentUserId={currentUserId}
                  onComplete={handleCompleteChallenge}
                  variant="full"
                />
              </div>
            )}

            {/* Send Challenge Form */}
            <div className="bg-background border border-neutral rounded-xl p-6">
              <h3 className="text-xl font-bold text-foreground mb-2">
                <i className="fas fa-dumbbell mr-2 text-primary"></i>
                Assign Workout to Friend
              </h3>
              <p className="text-foreground/60 text-sm mb-4">
                Send a specific workout challenge to help your friend stay
                motivated!
              </p>

              {activeChallenge ? (
                <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
                  <p className="text-warning flex items-center gap-2">
                    <i className="fas fa-info-circle"></i>
                    You can&apos;t send or accept new challenges while you have
                    an active challenge. Complete your current challenge first!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Friend Selection - Custom Dropdown */}
                    <div className="relative" ref={friendDropdownRef}>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Select Friend *
                      </label>
                      <button
                        type="button"
                        onClick={handleFriendDropdownOpen}
                        className="w-full p-3 border border-neutral rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary text-left flex items-center justify-between"
                      >
                        <span
                          className={
                            selectedFriend
                              ? "text-foreground"
                              : "text-foreground/50"
                          }
                        >
                          {selectedFriend || "Click to choose a friend..."}
                        </span>
                        <i
                          className={`fas fa-chevron-down transition-transform ${
                            friendDropdownOpen ? "rotate-180" : ""
                          }`}
                        ></i>
                      </button>

                      {/* Dropdown Menu */}
                      {friendDropdownOpen && (
                        <div className="absolute z-50 w-full mt-1 bg-background border border-neutral rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {loadingFriendsDropdown ? (
                            <div className="p-4 text-center">
                              <i className="fas fa-circle-notch fa-spin text-primary mr-2"></i>
                              Loading friends...
                            </div>
                          ) : friendsForChallenge.length === 0 ? (
                            <div className="p-4 text-center text-foreground/70">
                              <i className="fas fa-user-friends mr-2"></i>
                              No friends found. Add some friends first!
                            </div>
                          ) : (
                            friendsForChallenge.map((friend) => (
                              <button
                                key={friend._id}
                                type="button"
                                onClick={() => selectFriend(friend.username)}
                                className={`w-full p-3 text-left hover:bg-primary/10 transition-colors flex items-center gap-3 ${
                                  selectedFriend === friend.username
                                    ? "bg-primary/20"
                                    : ""
                                }`}
                              >
                                <div className="w-8 h-8 rounded-full bg-secondary/20 flex items-center justify-center">
                                  <i className="fas fa-user text-secondary text-sm"></i>
                                </div>
                                <span className="font-medium">
                                  {friend.username}
                                </span>
                                {selectedFriend === friend.username && (
                                  <i className="fas fa-check text-primary ml-auto"></i>
                                )}
                              </button>
                            ))
                          )}
                        </div>
                      )}
                    </div>

                    {/* Exercise Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        <i className="fas fa-dumbbell mr-1 text-primary"></i>
                        Select Workout
                      </label>
                      <select
                        value={selectedExercise}
                        onChange={(e) => setSelectedExercise(e.target.value)}
                        className="w-full p-3 border border-neutral rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">
                          Choose an exercise to assign...
                        </option>
                        {exercises.map((exercise) => (
                          <option key={exercise._id} value={exercise._id}>
                            {exercise.name}{" "}
                            {exercise.category ? `(${exercise.category})` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Days Selection */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Duration (Days)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={challengeDays}
                        onChange={(e) =>
                          setChallengeDays(parseInt(e.target.value) || 7)
                        }
                        className="w-full p-3 border border-neutral rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="7"
                      />
                    </div>

                    {/* Message */}
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Message (Optional)
                      </label>
                      <input
                        type="text"
                        value={challengeMessage}
                        onChange={(e) => setChallengeMessage(e.target.value)}
                        className="w-full p-3 border border-neutral rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="Let's see what you got!"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleSendChallenge}
                      disabled={isSendingChallenge || !selectedFriend}
                      className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {isSendingChallenge ? (
                        <>
                          <i className="fas fa-circle-notch fa-spin"></i>
                          Sending...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane"></i>
                          {selectedExercise
                            ? "Assign Workout"
                            : "Send Challenge"}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Pending Challenges (Received) */}
            {(() => {
              const pendingReceived = challenges.filter(
                (c) =>
                  c.status === "pending" &&
                  String(c.toUser._id) === String(currentUserId)
              );
              if (pendingReceived.length === 0) return null;

              return (
                <div className="bg-background border border-warning rounded-xl p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <i className="fas fa-inbox text-warning"></i>
                    Pending Workout Challenges
                    <span className="bg-warning text-white text-sm px-2 py-1 rounded-full">
                      {pendingReceived.length}
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingReceived.map((challenge) => (
                      <WorkoutChallengeCard
                        key={challenge._id}
                        challenge={challenge}
                        currentUserId={currentUserId}
                        onAccept={(id) => handleRespondToChallenge(id, true)}
                        onDecline={(id) => handleRespondToChallenge(id, false)}
                        hasActiveChallenge={!!activeChallenge}
                        variant="full"
                      />
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* Pending Challenges Sent */}
            {(() => {
              const pendingSent = challenges.filter(
                (c) =>
                  c.status === "pending" &&
                  String(c.fromUser._id) === String(currentUserId)
              );
              if (pendingSent.length === 0) return null;

              return (
                <div className="bg-background border border-primary/50 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                    <i className="fas fa-paper-plane text-primary"></i>
                    Workout Challenges Sent
                    <span className="bg-primary text-white text-sm px-2 py-1 rounded-full">
                      {pendingSent.length}
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pendingSent.map((challenge) => (
                      <WorkoutChallengeCard
                        key={challenge._id}
                        challenge={challenge}
                        currentUserId={currentUserId}
                        variant="full"
                      />
                    ))}
                  </div>
                </div>
              );
            })()}

            {/* All Challenges List */}
            <div className="bg-background border border-neutral rounded-xl p-6">
              <h3 className="text-xl font-bold text-foreground mb-4">
                <i className="fas fa-history mr-2 text-secondary"></i>
                Challenge History
              </h3>

              {challengesLoading ? (
                <div className="text-center py-12">
                  <i className="fas fa-circle-notch fa-spin text-primary text-4xl"></i>
                </div>
              ) : challenges.length === 0 ? (
                <div className="text-center py-8">
                  <i className="fas fa-trophy text-foreground/30 text-4xl mb-4"></i>
                  <p className="text-foreground/70">
                    No challenges yet. Assign a workout to a friend!
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {challenges
                    .filter((c) => c.status !== "pending") // Pending ones are shown above
                    .map((challenge) => (
                      <WorkoutChallengeCard
                        key={challenge._id}
                        challenge={challenge}
                        currentUserId={currentUserId}
                        onComplete={handleCompleteChallenge}
                        variant="full"
                      />
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
