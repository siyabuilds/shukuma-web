"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "@fortawesome/fontawesome-free/css/all.min.css";

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <i className="fas fa-circle-notch fa-spin text-primary text-4xl"></i>
      </div>
    );
  }

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-foreground mb-4">
              Welcome Back! 💪
            </h1>
            <p className="text-xl text-foreground/70 mb-8">
              Ready to crush your fitness goals today?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Daily Exercise Card */}
            <Link href="/daily">
              <div className="bg-background border border-neutral rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
                  <i className="fas fa-calendar-day text-primary text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Today's Workout
                </h3>
                <p className="text-foreground/70">
                  Get your daily exercise routine and start training
                </p>
              </div>
            </Link>

            {/* Exercises Card */}
            <Link href="/exercises">
              <div className="bg-background border border-neutral rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-secondary/10 rounded-full mb-4">
                  <i className="fas fa-dumbbell text-secondary text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Browse Exercises
                </h3>
                <p className="text-foreground/70">
                  Explore all available exercises and workouts
                </p>
              </div>
            </Link>

            {/* Progress Card */}
            <Link href="/progress">
              <div className="bg-background border border-neutral rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-success/10 rounded-full mb-4">
                  <i className="fas fa-chart-line text-success text-2xl"></i>
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  Track Progress
                </h3>
                <p className="text-foreground/70">
                  View your fitness journey and achievements
                </p>
              </div>
            </Link>
          </div>

          {/* Quick Stats Section */}
          <div className="mt-12 bg-background border border-neutral rounded-2xl p-8">
            <h2 className="text-3xl font-bold text-foreground mb-6">
              Quick Stats
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">0</div>
                <p className="text-foreground/70">Workouts Completed</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-secondary mb-2">0</div>
                <p className="text-foreground/70">Days Active</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-success mb-2">0</div>
                <p className="text-foreground/70">Personal Records</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-foreground mb-4">
            Welcome to Shukuma
          </h1>
          <p className="text-xl text-foreground/70 mb-8">
            Your personal fitness tracking companion
          </p>
          <div className="flex flex-col md:flex-row justify-center gap-4 max-w-md mx-auto md:max-w-none">
            <a
              href="/login"
              className="bg-primary text-white px-8 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
            >
              <i className="fas fa-sign-in-alt"></i>
              Login
            </a>
            <a
              href="/register"
              className="bg-secondary text-white px-8 py-3 rounded-lg font-semibold hover:bg-secondary/90 transition-all duration-300 hover:shadow-lg flex items-center justify-center gap-2"
            >
              <i className="fas fa-user-plus"></i>
              Register
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
