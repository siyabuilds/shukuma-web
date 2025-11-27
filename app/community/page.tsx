"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { showAlert } from "@/utils/swal";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface User {
  _id: string;
  username: string;
  email: string;
}

interface Post {
  _id: string;
  userId: User;
  content: string;
  type?: string;
  meta?: any;
  likes: string[];
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

interface Challenge {
  _id: string;
  fromUser: User;
  toUser: User;
  exerciseId?: string;
  message?: string;
  status: "pending" | "accepted" | "completed";
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

  // Friends state
  const [friends, setFriends] = useState<FriendRequest[]>([]);
  const [friendsLoading, setFriendsLoading] = useState(true);
  const [friendUsername, setFriendUsername] = useState("");

  // Challenges state
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [challengesLoading, setChallengesLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Decode token to get current user info
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      setCurrentUserId(payload._id);
      setCurrentUsername(payload.username);
    } catch (err) {
      console.error("Failed to decode token:", err);
    }

    fetchFeed();
    fetchFriends();
    fetchChallenges();
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
                        </div>
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
                  className="bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors whitespace-nowrap"
                >
                  <i className="fas fa-user-plus mr-2"></i>
                  Send Request
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
            {challengesLoading ? (
              <div className="text-center py-12">
                <i className="fas fa-circle-notch fa-spin text-primary text-4xl"></i>
              </div>
            ) : challenges.length === 0 ? (
              <div className="text-center py-12 bg-background border border-neutral rounded-xl">
                <i className="fas fa-trophy text-foreground/30 text-6xl mb-4"></i>
                <p className="text-foreground/70">
                  No challenges yet. Challenge your friends to compete!
                </p>
              </div>
            ) : (
              challenges.map((challenge) => {
                const isSender = currentUserId === challenge.fromUser._id;
                const otherUser = isSender
                  ? challenge.toUser
                  : challenge.fromUser;

                return (
                  <div
                    key={challenge._id}
                    className="bg-background border border-neutral rounded-xl p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-warning/10 flex items-center justify-center">
                          <i className="fas fa-trophy text-warning text-xl"></i>
                        </div>
                        <div>
                          <p className="text-foreground">
                            {isSender ? (
                              <>
                                <span className="font-bold">You</span>{" "}
                                challenged{" "}
                                <Link
                                  href={`/community/profile/${otherUser.username}`}
                                  className="font-bold hover:text-primary"
                                >
                                  {otherUser.username}
                                </Link>
                              </>
                            ) : (
                              <>
                                <Link
                                  href={`/community/profile/${otherUser.username}`}
                                  className="font-bold hover:text-primary"
                                >
                                  {otherUser.username}
                                </Link>{" "}
                                challenged{" "}
                                <span className="font-bold">you</span>
                              </>
                            )}
                          </p>
                          {challenge.message && (
                            <p className="text-sm text-foreground/60 mt-1">
                              "{challenge.message}"
                            </p>
                          )}
                          <p className="text-xs text-foreground/50 mt-1">
                            {formatDate(challenge.createdAt)}
                          </p>
                        </div>
                      </div>
                      <div>
                        <span
                          className={`px-4 py-2 rounded-lg font-semibold ${
                            challenge.status === "completed"
                              ? "bg-success/10 text-success"
                              : challenge.status === "accepted"
                              ? "bg-secondary/10 text-secondary"
                              : "bg-warning/10 text-warning"
                          }`}
                        >
                          {challenge.status.charAt(0).toUpperCase() +
                            challenge.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>
    </div>
  );
}
