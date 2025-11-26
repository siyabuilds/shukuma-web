"use client";

import { useState } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface ExerciseFlipCardProps {
  name: string;
  description?: string;
  type: "core" | "lowerbody" | "cardio" | "upperbody";
  difficulty: "easy" | "medium" | "hard";
  demonstration?: string;
  duration?: number;
  reps?: number;
}

export default function ExerciseFlipCard({
  name,
  description,
  type,
  difficulty,
  demonstration,
  duration,
  reps,
}: ExerciseFlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

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
        return "bg-primary";
      case "lowerbody":
        return "bg-secondary";
      case "cardio":
        return "bg-warning";
      case "upperbody":
        return "bg-success";
      default:
        return "bg-primary";
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

  return (
    <div className="flip-card-container w-full h-[480px]">
      <div
        className={`flip-card-inner ${isFlipped ? "flipped" : ""}`}
        onClick={() => setIsFlipped(!isFlipped)}
      >
        {/* Front of card */}
        <div className="flip-card-face flip-card-front">
          <div className="bg-background border-2 border-neutral rounded-2xl shadow-xl h-full flex flex-col overflow-hidden hover:shadow-2xl hover:border-primary/50 transition-all duration-300">
            {/* Card Header */}
            <div className={`${getTypeBgColor(type)} p-4 text-white relative`}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <i className={`fas ${getTypeIcon(type)} text-xl`}></i>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                    difficulty
                  )} bg-white/90`}
                >
                  {difficulty.toUpperCase()}
                </span>
              </div>
              <h3 className="text-xl font-bold">{name}</h3>
            </div>

            {/* Card Body */}
            <div className="p-4 flex-1 flex flex-col justify-between overflow-y-auto">
              {description && (
                <p className="text-foreground/70 text-sm mb-4 line-clamp-4">
                  {description}
                </p>
              )}

              <div className="space-y-3 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <i
                    className={`fas ${getTypeIcon(type)} ${getTypeColor(type)}`}
                  ></i>
                  <span className="text-foreground/70 capitalize text-sm">
                    {type} exercise
                  </span>
                </div>

                {duration && (
                  <div className="flex items-center gap-3">
                    <i className="fas fa-clock text-secondary"></i>
                    <span className="text-foreground/70 text-sm">
                      {duration} seconds
                    </span>
                  </div>
                )}

                {reps && (
                  <div className="flex items-center gap-3">
                    <i className="fas fa-redo text-success"></i>
                    <span className="text-foreground/70 text-sm">
                      {reps} repetitions
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-neutral flex items-center justify-center gap-2 text-primary font-medium text-sm animate-pulse flex-shrink-0">
                <i className="fas fa-sync-alt"></i>
                <span>Click to see demonstration</span>
              </div>
            </div>
          </div>
        </div>

        {/* Back of card */}
        <div className="flip-card-face flip-card-back">
          <div className="bg-background border-2 border-primary rounded-2xl shadow-xl h-full flex flex-col overflow-hidden hover:shadow-2xl transition-all duration-300">
            {/* Back Header */}
            <div className={`${getTypeBgColor(type)} p-4 text-white`}>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold">
                  <i className="fas fa-image mr-2"></i>
                  Demonstration
                </h3>
                <i className="fas fa-sync-alt text-white/70 animate-spin-slow"></i>
              </div>
            </div>

            {/* Back Body */}
            <div className="p-4 flex-1 flex flex-col justify-between overflow-y-auto">
              {demonstration ? (
                <div className="w-full flex-1 flex flex-col items-center justify-center min-h-0">
                  <div className="relative w-full flex-1 flex items-center justify-center bg-neutral/10 rounded-xl overflow-hidden mb-3 min-h-0">
                    <img
                      src={demonstration}
                      alt={`${name} demonstration`}
                      className="max-w-full max-h-full object-contain transition-transform duration-300 hover:scale-105"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                  <p className="text-foreground/70 text-xs text-center px-2 flex-shrink-0">
                    <i className="fas fa-qrcode mr-1"></i>
                    Scan QR code on image for video tutorial
                  </p>
                </div>
              ) : (
                <div className="text-center flex-1 flex flex-col items-center justify-center">
                  <i className="fas fa-exclamation-circle text-foreground/30 text-5xl mb-4"></i>
                  <p className="text-foreground/50 text-sm">
                    No demonstration available
                  </p>
                </div>
              )}

              <div className="mt-3 pt-3 border-t border-neutral w-full text-center flex-shrink-0">
                <p className="text-primary font-medium text-xs animate-pulse">
                  <i className="fas fa-sync-alt mr-1"></i>
                  Click to flip back
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .flip-card-container {
          perspective: 1000px;
        }

        .flip-card-inner {
          position: relative;
          width: 100%;
          height: 100%;
          transition: transform 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
          cursor: pointer;
        }

        .flip-card-inner.flipped {
          transform: rotateY(180deg);
        }

        .flip-card-face {
          position: absolute;
          width: 100%;
          height: 100%;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }

        .flip-card-front {
          transform: rotateY(0deg);
        }

        .flip-card-back {
          transform: rotateY(180deg);
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
