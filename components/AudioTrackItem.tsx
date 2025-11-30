"use client";

import { useState, useRef, useEffect } from "react";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface AudioTrackItemProps {
  id: string;
  name: string;
  url: string;
  index: number;
  isCurrentlyPlaying: boolean;
  onPlay: (id: string) => void;
  onPause: () => void;
}

const formatTime = (seconds: number): string => {
  if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const getTrackIcon = (name: string): string => {
  const lowerName = name.toLowerCase();
  if (lowerName.includes("bird")) return "fa-dove";
  if (lowerName.includes("ocean") || lowerName.includes("wave"))
    return "fa-water";
  if (lowerName.includes("rain")) return "fa-cloud-rain";
  if (lowerName.includes("thunder") || lowerName.includes("storm"))
    return "fa-cloud-bolt";
  if (lowerName.includes("forest") || lowerName.includes("river"))
    return "fa-tree";
  if (lowerName.includes("wind")) return "fa-wind";
  if (lowerName.includes("fire") || lowerName.includes("fireplace"))
    return "fa-fire";
  if (lowerName.includes("night") || lowerName.includes("cricket"))
    return "fa-moon";
  return "fa-volume-high";
};

const getTrackColor = (
  index: number
): { bg: string; text: string; border: string } => {
  const colors = [
    { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30" },
    {
      bg: "bg-secondary/10",
      text: "text-secondary",
      border: "border-secondary/30",
    },
    { bg: "bg-success/10", text: "text-success", border: "border-success/30" },
    { bg: "bg-warning/10", text: "text-warning", border: "border-warning/30" },
  ];
  return colors[index % colors.length];
};

export default function AudioTrackItem({
  id,
  name,
  url,
  index,
  isCurrentlyPlaying,
  onPlay,
  onPause,
}: AudioTrackItemProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [volume, setVolume] = useState(0.7);
  const [isLooping, setIsLooping] = useState(false);

  const colors = getTrackColor(index);
  const icon = getTrackIcon(name);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoading(false);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      if (!isLooping) {
        setIsPlaying(false);
        setCurrentTime(0);
      }
    };

    const handleCanPlay = () => {
      setIsLoading(false);
    };

    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("canplay", handleCanPlay);

    return () => {
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("canplay", handleCanPlay);
    };
  }, [isLooping]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.loop = isLooping;
    }
  }, [isLooping]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      onPause();
    } else {
      onPlay(id);
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  // Pause this track when another track starts playing
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (!isCurrentlyPlaying && isPlaying) {
      audio.pause();
      setIsPlaying(false);
    }
  }, [isCurrentlyPlaying, isPlaying]);

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio || !duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = clickX / rect.width;
    const newTime = percentage * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border ${colors.border} ${colors.bg} p-4 sm:p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.01]`}
    >
      <audio ref={audioRef} src={url} preload="metadata" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        {/* Icon & Name */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div
            className={`flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${colors.bg} flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
          >
            <i className={`fas ${icon} ${colors.text} text-xl sm:text-2xl`}></i>
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground truncate">
              {name}
            </h3>
            <div className="flex items-center gap-3 text-sm text-foreground/60">
              <span className="flex items-center gap-1">
                <i className="fas fa-clock text-xs"></i>
                {isLoading ? (
                  <span className="animate-pulse">Loading...</span>
                ) : (
                  <span>{formatTime(duration)}</span>
                )}
              </span>
              {isPlaying && (
                <span className={`flex items-center gap-1 ${colors.text}`}>
                  <i className="fas fa-circle text-[6px] animate-pulse"></i>
                  Playing
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
          {/* Loop Button */}
          <button
            onClick={() => setIsLooping(!isLooping)}
            className={`p-2 sm:p-3 rounded-xl transition-all duration-200 ${
              isLooping
                ? `${colors.bg} ${colors.text}`
                : "bg-neutral/20 text-foreground/50 hover:text-foreground"
            }`}
            title={isLooping ? "Disable loop" : "Enable loop"}
          >
            <i className="fas fa-repeat text-sm sm:text-base"></i>
          </button>

          {/* Volume Control */}
          <div className="hidden sm:flex items-center gap-2 bg-neutral/10 rounded-xl px-3 py-2">
            <i className="fas fa-volume-low text-foreground/60 text-sm"></i>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className={`w-16 h-1 rounded-lg appearance-none cursor-pointer accent-primary`}
              style={{
                background: `linear-gradient(to right, var(--primary) ${
                  volume * 100
                }%, var(--neutral) ${volume * 100}%)`,
              }}
            />
          </div>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            disabled={isLoading}
            className={`relative flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-xl font-semibold transition-all duration-300 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              isPlaying
                ? "bg-foreground/10 text-foreground hover:bg-foreground/20"
                : `bg-primary text-white hover:bg-primary/90`
            }`}
          >
            {isLoading ? (
              <i className="fas fa-circle-notch fa-spin text-lg"></i>
            ) : isPlaying ? (
              <i className="fas fa-pause text-lg"></i>
            ) : (
              <i className="fas fa-play text-lg ml-1"></i>
            )}
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-4">
        <div
          className="relative h-2 bg-neutral/30 rounded-full cursor-pointer overflow-hidden group/progress"
          onClick={handleProgressClick}
        >
          <div
            className={`absolute left-0 top-0 h-full bg-primary rounded-full transition-all duration-100`}
            style={{ width: `${progressPercentage}%` }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full shadow-lg opacity-0 group-hover/progress:opacity-100 transition-opacity"
            style={{ left: `calc(${progressPercentage}% - 6px)` }}
          />
        </div>
        <div className="flex justify-between text-xs text-foreground/50 mt-1">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
