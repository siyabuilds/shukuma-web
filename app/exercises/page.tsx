"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface Exercise {
  _id: string;
  name: string;
  description?: string;
  type: "core" | "lowerbody" | "cardio" | "upperbody";
  difficulty: "easy" | "medium" | "hard";
  demonstration?: string;
  duration?: number;
  reps?: number;
}

export default function ExercisesPage() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 13;

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch("/api/exercises", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (response.ok) {
          setExercises(data);
          setFilteredExercises(data);
        } else {
          setError(data.message || "Failed to load exercises");
        }
      } catch (err) {
        setError("Network error. Please check your connection.");
        console.error("Exercises fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

  useEffect(() => {
    let filtered = exercises;

    // Filter by type
    if (selectedType !== "all") {
      filtered = filtered.filter((ex) => ex.type === selectedType);
    }

    // Filter by difficulty
    if (selectedDifficulty !== "all") {
      filtered = filtered.filter((ex) => ex.difficulty === selectedDifficulty);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter((ex) =>
        ex.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredExercises(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [selectedType, selectedDifficulty, searchQuery, exercises]);

  // Calculate pagination
  const totalPages = Math.ceil(filteredExercises.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const currentExercises = filteredExercises.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-circle-notch fa-spin text-primary text-5xl mb-4"></i>
          <p className="text-foreground/70 text-lg">Loading exercises...</p>
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
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4">
            <i className="fas fa-arrow-left text-foreground/70 hover:text-primary transition-colors mr-2"></i>
            <span className="text-foreground/70 hover:text-primary transition-colors">
              Back to Home
            </span>
          </Link>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            <i className="fas fa-dumbbell text-secondary mr-3"></i>
            Browse Exercises
          </h1>
          <p className="text-foreground/70">
            Explore {exercises.length} exercises to build your perfect workout
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-background border border-neutral rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <i className="fas fa-search text-primary mr-2"></i>
                Search
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search exercises..."
                className="w-full px-4 py-3 bg-background border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-foreground transition-all duration-200"
              />
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <i className="fas fa-filter text-secondary mr-2"></i>
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent text-foreground transition-all duration-200"
              >
                <option value="all">All Types</option>
                <option value="core">Core</option>
                <option value="lowerbody">Lower Body</option>
                <option value="cardio">Cardio</option>
                <option value="upperbody">Upper Body</option>
              </select>
            </div>

            {/* Difficulty Filter */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                <i className="fas fa-signal text-success mr-2"></i>
                Difficulty
              </label>
              <select
                value={selectedDifficulty}
                onChange={(e) => setSelectedDifficulty(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-neutral rounded-lg focus:outline-none focus:ring-2 focus:ring-success focus:border-transparent text-foreground transition-all duration-200"
              >
                <option value="all">All Levels</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          {/* Active Filters Info */}
          {(selectedType !== "all" ||
            selectedDifficulty !== "all" ||
            searchQuery) && (
            <div className="mt-4 flex items-center gap-2 text-sm text-foreground/70">
              <i className="fas fa-info-circle text-primary"></i>
              <span>
                Showing {startIndex + 1}-
                {Math.min(endIndex, filteredExercises.length)} of{" "}
                {filteredExercises.length} exercises
              </span>
              <button
                onClick={() => {
                  setSelectedType("all");
                  setSelectedDifficulty("all");
                  setSearchQuery("");
                }}
                className="ml-auto text-primary hover:text-primary/80 font-medium"
              >
                Clear Filters
              </button>
            </div>
          )}

          {/* Pagination Info */}
          {!searchQuery &&
            selectedType === "all" &&
            selectedDifficulty === "all" &&
            filteredExercises.length > ITEMS_PER_PAGE && (
              <div className="mt-4 text-sm text-foreground/70">
                <i className="fas fa-layer-group text-secondary mr-2"></i>
                Page {currentPage} of {totalPages} • Showing {startIndex + 1}-
                {Math.min(endIndex, filteredExercises.length)} of{" "}
                {filteredExercises.length} exercises
              </div>
            )}
        </div>

        {/* Exercises Grid */}
        {filteredExercises.length === 0 ? (
          <div className="text-center py-12">
            <i className="fas fa-search text-foreground/30 text-6xl mb-4"></i>
            <h3 className="text-2xl font-bold text-foreground mb-2">
              No exercises found
            </h3>
            <p className="text-foreground/70 mb-6">
              Try adjusting your filters or search query
            </p>
            <button
              onClick={() => {
                setSelectedType("all");
                setSelectedDifficulty("all");
                setSearchQuery("");
              }}
              className="bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary/90 transition-all duration-300"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentExercises.map((exercise) => (
                <Link
                  key={exercise._id}
                  href={`/exercises/${exercise._id}`}
                  className="block"
                >
                  <div className="bg-background border border-neutral rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 hover:scale-105 cursor-pointer h-full">
                    {/* Card Header */}
                    <div
                      className={`${getTypeBgColor(
                        exercise.type
                      )} p-4 border-b border-neutral`}
                    >
                      <div className="flex items-center justify-between">
                        <div
                          className={`w-12 h-12 rounded-full bg-background border border-neutral flex items-center justify-center`}
                        >
                          <i
                            className={`fas ${getTypeIcon(
                              exercise.type
                            )} ${getTypeColor(exercise.type)} text-xl`}
                          ></i>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getDifficultyColor(
                            exercise.difficulty
                          )}`}
                        >
                          {exercise.difficulty.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-foreground mb-3 line-clamp-2">
                        {exercise.name}
                      </h3>

                      {exercise.description && (
                        <p className="text-foreground/70 text-sm mb-4 line-clamp-3">
                          {exercise.description}
                        </p>
                      )}

                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <i
                            className={`fas ${getTypeIcon(
                              exercise.type
                            )} ${getTypeColor(exercise.type)}`}
                          ></i>
                          <span className="text-foreground/70 capitalize">
                            {exercise.type}
                          </span>
                        </div>

                        {exercise.duration && (
                          <div className="flex items-center gap-2">
                            <i className="fas fa-clock text-secondary"></i>
                            <span className="text-foreground/70">
                              {exercise.duration}s
                            </span>
                          </div>
                        )}

                        {exercise.reps && (
                          <div className="flex items-center gap-2">
                            <i className="fas fa-redo text-success"></i>
                            <span className="text-foreground/70">
                              {exercise.reps} reps
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="px-6 pb-6">
                      <div className="flex items-center justify-between text-sm text-primary font-medium">
                        <span>View Details</span>
                        <i className="fas fa-arrow-right"></i>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    currentPage === 1
                      ? "bg-neutral/20 text-foreground/30 cursor-not-allowed"
                      : "bg-background border border-neutral text-foreground hover:bg-neutral/20"
                  }`}
                >
                  <i className="fas fa-chevron-left mr-2"></i>
                  Previous
                </button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => {
                      // Show first page, last page, current page, and pages around current
                      const showPage =
                        page === 1 ||
                        page === totalPages ||
                        (page >= currentPage - 1 && page <= currentPage + 1);

                      const showEllipsisBefore =
                        page === currentPage - 2 && currentPage > 3;
                      const showEllipsisAfter =
                        page === currentPage + 2 &&
                        currentPage < totalPages - 2;

                      if (showEllipsisBefore || showEllipsisAfter) {
                        return (
                          <span
                            key={page}
                            className="px-3 py-2 text-foreground/50"
                          >
                            ...
                          </span>
                        );
                      }

                      if (!showPage) return null;

                      return (
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                            currentPage === page
                              ? "bg-primary text-white"
                              : "bg-background border border-neutral text-foreground hover:bg-neutral/20"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                    currentPage === totalPages
                      ? "bg-neutral/20 text-foreground/30 cursor-not-allowed"
                      : "bg-background border border-neutral text-foreground hover:bg-neutral/20"
                  }`}
                >
                  Next
                  <i className="fas fa-chevron-right ml-2"></i>
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
