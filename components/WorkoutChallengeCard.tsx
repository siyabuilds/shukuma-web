"use client";

import Link from "next/link";

interface Exercise {
  _id: string;
  name: string;
  description?: string;
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

interface User {
  _id: string;
  username: string;
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

interface WorkoutChallengeCardProps {
  challenge: Challenge;
  currentUserId: string | null;
  onAccept?: (challengeId: string) => void;
  onDecline?: (challengeId: string) => void;
  onComplete?: (challengeId: string) => void;
  variant?: "compact" | "full";
  hasActiveChallenge?: boolean;
}

const getTypeIcon = (type?: string) => {
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

const getTypeColor = (type?: string) => {
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

const getTypeBgColor = (type?: string) => {
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

const getDifficultyColor = (difficulty?: string) => {
  switch (difficulty) {
    case "easy":
      return "bg-success/20 text-success";
    case "medium":
      return "bg-warning/20 text-warning";
    case "hard":
      return "bg-red-500/20 text-red-500";
    default:
      return "bg-neutral/20 text-foreground";
  }
};

const getTimeRemaining = (deadline: string) => {
  const now = new Date().getTime();
  const deadlineTime = new Date(deadline).getTime();
  const diff = deadlineTime - now;

  if (diff <= 0) return { expired: true, text: "Expired", urgent: true };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 3) {
    return { expired: false, text: `${days}d ${hours}h`, urgent: false };
  } else if (days > 0) {
    return { expired: false, text: `${days}d ${hours}h`, urgent: true };
  } else if (hours > 0) {
    return { expired: false, text: `${hours}h ${minutes}m`, urgent: true };
  } else {
    return { expired: false, text: `${minutes}m`, urgent: true };
  }
};

export default function WorkoutChallengeCard({
  challenge,
  currentUserId,
  onAccept,
  onDecline,
  onComplete,
  variant = "full",
  hasActiveChallenge = false,
}: WorkoutChallengeCardProps) {
  const exercise = challenge.exerciseId || challenge.exerciseSnapshot;
  const isRecipient = currentUserId === challenge.toUser._id;
  const isSender = currentUserId === challenge.fromUser._id;
  const otherUser = isRecipient ? challenge.fromUser : challenge.toUser;

  // Get the exercise details from either the populated exercise or the snapshot
  const exerciseName = exercise?.name;
  const exerciseType =
    exercise?.type || (challenge.exerciseId as Exercise)?.type;
  const exerciseDifficulty =
    exercise?.difficulty || (challenge.exerciseId as Exercise)?.difficulty;
  const exerciseDuration =
    exercise?.duration || (challenge.exerciseId as Exercise)?.duration;
  const exerciseReps =
    exercise?.reps || (challenge.exerciseId as Exercise)?.reps;
  const exerciseDescription =
    exercise?.description || (challenge.exerciseId as Exercise)?.description;

  if (!exercise && variant === "compact") {
    // Compact view without workout - show simple challenge card
    return (
      <div className="bg-neutral/10 rounded-lg p-4 border border-neutral/30">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-foreground">
              {isRecipient ? (
                <>
                  <Link
                    href={`/community/profile/${challenge.fromUser.username}`}
                    className="font-bold hover:text-primary"
                  >
                    {challenge.fromUser.username}
                  </Link>{" "}
                  challenged you
                </>
              ) : (
                <>
                  You challenged{" "}
                  <Link
                    href={`/community/profile/${challenge.toUser.username}`}
                    className="font-bold hover:text-primary"
                  >
                    {challenge.toUser.username}
                  </Link>
                </>
              )}
            </p>
            {challenge.message && (
              <p className="text-xs text-foreground/60 mt-1 italic">
                "{challenge.message}"
              </p>
            )}
          </div>
          <span
            className={`px-2 py-1 rounded text-xs font-semibold ${
              challenge.status === "pending"
                ? "bg-warning/20 text-warning"
                : challenge.status === "accepted"
                ? "bg-secondary/20 text-secondary"
                : challenge.status === "completed"
                ? "bg-success/20 text-success"
                : "bg-red-500/20 text-red-500"
            }`}
          >
            {challenge.status}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-xl overflow-hidden ${
        challenge.status === "accepted" && !challenge.isComplete
          ? "bg-gradient-to-br from-primary/5 to-secondary/5 border-2 border-primary/30"
          : "bg-background border border-neutral"
      }`}
    >
      {/* Header with Workout Info */}
      {exercise && (
        <div className={`p-4 ${getTypeBgColor(exerciseType)}`}>
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-full bg-white/90 dark:bg-background flex items-center justify-center shadow-sm`}
            >
              <i
                className={`fas ${getTypeIcon(exerciseType)} ${getTypeColor(
                  exerciseType
                )} text-xl`}
              ></i>
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground text-lg">
                {exerciseName}
              </h3>
              <div className="flex flex-wrap items-center gap-2 mt-1">
                {exerciseType && (
                  <span className="text-xs text-foreground/70 capitalize">
                    {exerciseType}
                  </span>
                )}
                {exerciseDifficulty && (
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getDifficultyColor(
                      exerciseDifficulty
                    )}`}
                  >
                    {exerciseDifficulty}
                  </span>
                )}
                {exerciseDuration && (
                  <span className="text-xs text-foreground/70">
                    <i className="fas fa-clock mr-1"></i>
                    {exerciseDuration}s
                  </span>
                )}
                {exerciseReps && (
                  <span className="text-xs text-foreground/70">
                    <i className="fas fa-redo mr-1"></i>
                    {exerciseReps} reps
                  </span>
                )}
              </div>
            </div>
          </div>
          {exerciseDescription && variant === "full" && (
            <p className="text-sm text-foreground/70 mt-3 line-clamp-2">
              {exerciseDescription}
            </p>
          )}
        </div>
      )}

      {/* Challenge Details */}
      <div className="p-4">
        {/* From/To User */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center">
              <i className="fas fa-user text-secondary text-sm"></i>
            </div>
            <div className="text-sm">
              {isRecipient ? (
                <>
                  <span className="text-foreground/70">From </span>
                  <Link
                    href={`/community/profile/${challenge.fromUser.username}`}
                    className="font-bold text-foreground hover:text-primary"
                  >
                    {challenge.fromUser.username}
                  </Link>
                </>
              ) : (
                <>
                  <span className="text-foreground/70">To </span>
                  <Link
                    href={`/community/profile/${challenge.toUser.username}`}
                    className="font-bold text-foreground hover:text-primary"
                  >
                    {challenge.toUser.username}
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Status Badge */}
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              challenge.status === "pending"
                ? "bg-warning/20 text-warning"
                : challenge.status === "accepted"
                ? "bg-secondary/20 text-secondary"
                : challenge.status === "completed"
                ? "bg-success/20 text-success"
                : "bg-red-500/20 text-red-500"
            }`}
          >
            {challenge.status === "completed" ? (
              <>
                <i className="fas fa-check mr-1"></i>Completed
              </>
            ) : challenge.status === "accepted" ? (
              <>
                <i className="fas fa-bolt mr-1"></i>Active
              </>
            ) : challenge.status === "pending" ? (
              <>
                <i className="fas fa-clock mr-1"></i>Pending
              </>
            ) : (
              <>
                <i className="fas fa-times mr-1"></i>Declined
              </>
            )}
          </span>
        </div>

        {/* Message */}
        {challenge.message && (
          <div className="bg-neutral/20 rounded-lg p-3 mb-3">
            <p className="text-sm text-foreground/80 italic">
              <i className="fas fa-quote-left text-foreground/30 mr-2"></i>
              {challenge.message}
            </p>
          </div>
        )}

        {/* Duration & Deadline Info */}
        <div className="flex flex-wrap items-center gap-3 text-sm text-foreground/70 mb-3">
          <span>
            <i className="fas fa-calendar-alt mr-1"></i>
            {challenge.durationDays} day challenge
          </span>
          {challenge.deadline && challenge.status === "accepted" && (
            <span
              className={`${
                getTimeRemaining(challenge.deadline).urgent
                  ? "text-warning font-semibold"
                  : ""
              }`}
            >
              <i
                className={`fas fa-hourglass-${
                  getTimeRemaining(challenge.deadline).urgent ? "end" : "half"
                } mr-1`}
              ></i>
              {getTimeRemaining(challenge.deadline).text} left
            </span>
          )}
        </div>

        {/* Actions */}
        {challenge.status === "pending" && isRecipient && (
          <div className="flex gap-2 mt-4">
            <button
              onClick={() => onAccept?.(challenge._id)}
              disabled={hasActiveChallenge}
              className="flex-1 px-4 py-2 bg-success text-white rounded-lg font-semibold hover:bg-success/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title={
                hasActiveChallenge
                  ? "Complete your current challenge first"
                  : "Accept challenge"
              }
            >
              <i className="fas fa-check mr-2"></i>
              Accept
            </button>
            <button
              onClick={() => onDecline?.(challenge._id)}
              className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg font-semibold hover:bg-red-600 transition-colors"
            >
              <i className="fas fa-times mr-2"></i>
              Decline
            </button>
          </div>
        )}

        {challenge.status === "accepted" &&
          !challenge.isComplete &&
          isRecipient && (
            <button
              onClick={() => onComplete?.(challenge._id)}
              className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-success to-success/80 text-white rounded-lg font-bold hover:from-success/90 hover:to-success/70 transition-all shadow-lg hover:shadow-xl"
            >
              <i className="fas fa-trophy mr-2"></i>
              Mark as Complete
            </button>
          )}

        {challenge.status === "pending" && isSender && (
          <div className="mt-4 text-center">
            <span className="text-sm text-foreground/60">
              <i className="fas fa-hourglass-half mr-2"></i>
              Waiting for {challenge.toUser.username} to respond...
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// Mini card for showing in exercise detail pages
export function WorkoutAssignButton({
  exerciseId,
  exerciseName,
  onClick,
}: {
  exerciseId: string;
  exerciseName: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-lg font-semibold hover:bg-primary/20 transition-colors"
    >
      <i className="fas fa-paper-plane"></i>
      <span>Assign to Friend</span>
    </button>
  );
}
