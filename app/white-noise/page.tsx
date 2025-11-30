"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AudioTrackItem from "@/components/AudioTrackItem";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface WhiteNoiseTrack {
  _id: string;
  name: string;
  url: string;
}

export default function WhiteNoisePage() {
  const [tracks, setTracks] = useState<WhiteNoiseTrack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentlyPlayingId, setCurrentlyPlayingId] = useState<string | null>(
    null
  );

  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch("/api/white-noise", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          setTracks(data);
        } else {
          setError(data.message || "Failed to load white noise tracks");
        }
      } catch (err) {
        setError("Network error. Please check your connection.");
        console.error("White noise fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTracks();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <i className="fas fa-headphones text-secondary text-6xl mb-4 animate-pulse"></i>
            <div className="absolute -top-1 -right-1">
              <span className="flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
              </span>
            </div>
          </div>
          <p className="text-foreground/70 text-lg mt-4">
            Loading ambient sounds...
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

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-4">
            <i className="fas fa-arrow-left text-foreground/70 hover:text-primary transition-colors mr-2"></i>
            <span className="text-foreground/70 hover:text-primary transition-colors">
              Back to Home
            </span>
          </Link>

          {/* Hero Section */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center justify-center opacity-5">
              <i className="fas fa-waveform-lines text-[200px] text-secondary"></i>
            </div>
            <div className="relative">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-secondary to-secondary/50 mb-4 shadow-lg">
                <i className="fas fa-headphones text-white text-3xl"></i>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-3">
                <span className="bg-gradient-to-r from-secondary to-primary bg-clip-text text-transparent">
                  White Noise
                </span>
              </h1>
              <p className="text-foreground/60 text-lg max-w-xl mx-auto">
                Relax, focus, and find your calm with our collection of ambient
                sounds
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-6 text-sm">
            <div className="flex items-center gap-2 text-foreground/60">
              <i className="fas fa-music text-secondary"></i>
              <span>{tracks.length} tracks available</span>
            </div>
            <div className="flex items-center gap-2 text-foreground/60">
              <i className="fas fa-infinity text-primary"></i>
              <span>Loop enabled</span>
            </div>
          </div>
        </div>

        {/* Info Card */}
        <div className="bg-gradient-to-r from-secondary/10 to-primary/10 border border-secondary/20 rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-secondary/20 flex items-center justify-center">
              <i className="fas fa-lightbulb text-secondary text-xl"></i>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Pro Tip</h3>
              <p className="text-foreground/70 text-sm">
                Use the loop button{" "}
                <i className="fas fa-repeat text-xs mx-1"></i> to continuously
                play your favorite ambient sound. Perfect for meditation,
                studying, or sleep.
              </p>
            </div>
          </div>
        </div>

        {/* Track List */}
        <div className="space-y-4">
          {tracks.map((track, index) => (
            <AudioTrackItem
              key={track._id}
              id={track._id}
              name={track.name}
              url={track.url}
              index={index}
              isCurrentlyPlaying={currentlyPlayingId === track._id}
              onPlay={(id) => setCurrentlyPlayingId(id)}
              onPause={() => setCurrentlyPlayingId(null)}
            />
          ))}
        </div>

        {/* Empty State */}
        {tracks.length === 0 && !loading && !error && (
          <div className="text-center py-16">
            <div className="w-20 h-20 rounded-full bg-neutral/20 flex items-center justify-center mx-auto mb-4">
              <i className="fas fa-volume-xmark text-foreground/40 text-3xl"></i>
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No tracks available
            </h3>
            <p className="text-foreground/60">
              Check back later for new ambient sounds.
            </p>
          </div>
        )}

        {/* Footer Note */}
        <div className="text-center mt-12 pt-8 border-t border-neutral/30">
          <p className="text-foreground/50 text-sm">
            <i className="fas fa-moon text-secondary mr-2"></i>
            Ambient sounds help reduce stress and improve concentration
          </p>
        </div>
      </div>
    </div>
  );
}
