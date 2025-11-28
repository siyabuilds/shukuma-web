"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { showAlert, showConfirm } from "@/utils/swal";
import "@fortawesome/fontawesome-free/css/all.min.css";

interface JournalEntry {
  _id: string;
  userId: string;
  date: string;
  title?: string;
  content: string;
  mood?: "great" | "good" | "okay" | "bad" | "terrible";
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

interface JournalResponse {
  journals: JournalEntry[];
  pagination: PaginationInfo;
}

const MOODS = [
  { value: "great", label: "Great", emoji: "😄", color: "text-success" },
  { value: "good", label: "Good", emoji: "🙂", color: "text-secondary" },
  { value: "okay", label: "Okay", emoji: "😐", color: "text-warning" },
  { value: "bad", label: "Bad", emoji: "😔", color: "text-primary" },
  { value: "terrible", label: "Terrible", emoji: "😢", color: "text-red-500" },
];

export default function JournalPage() {
  const router = useRouter();
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntry | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formMood, setFormMood] = useState<string>("");
  const [formTags, setFormTags] = useState("");
  const [formDate, setFormDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [submitting, setSubmitting] = useState(false);

  // View state
  const [expandedEntry, setExpandedEntry] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchJournals();
  }, [router, currentPage]);

  const fetchJournals = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/journal?page=${currentPage}&limit=10`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data: JournalResponse = await response.json();

      if (response.ok) {
        setJournals(data.journals);
        setPagination(data.pagination);
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
      } else {
        setError(
          data.journals ? "Failed to load journals" : "Failed to load journals"
        );
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
      console.error("Journal fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setFormContent("");
    setFormMood("");
    setFormTags("");
    setFormDate(new Date().toISOString().split("T")[0]);
    setEditingEntry(null);
    setIsFormOpen(false);
  };

  const openEditForm = (entry: JournalEntry) => {
    setEditingEntry(entry);
    setFormTitle(entry.title || "");
    setFormContent(entry.content);
    setFormMood(entry.mood || "");
    setFormTags(entry.tags?.join(", ") || "");
    setFormDate(new Date(entry.date).toISOString().split("T")[0]);
    setIsFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formContent.trim()) {
      showAlert("Error", "Journal content is required", "error");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    setSubmitting(true);

    try {
      const journalData = {
        title: formTitle.trim() || undefined,
        content: formContent.trim(),
        mood: formMood || undefined,
        tags: formTags
          ? formTags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : undefined,
        date: new Date(formDate).toISOString(),
      };

      const url = editingEntry
        ? `/api/journal/${editingEntry._id}`
        : "/api/journal";
      const method = editingEntry ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(journalData),
      });

      const data = await response.json();

      if (response.ok) {
        showAlert(
          "Success",
          editingEntry ? "Journal entry updated!" : "Journal entry created!",
          "success"
        );
        resetForm();
        fetchJournals();
      } else {
        showAlert(
          "Error",
          data.message || "Failed to save journal entry",
          "error"
        );
      }
    } catch (err) {
      console.error("Journal submit error:", err);
      showAlert("Error", "Network error. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await showConfirm(
      "Delete Entry?",
      "This action cannot be undone.",
      "Delete",
      "Cancel"
    );

    if (!result.isConfirmed) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`/api/journal/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        showAlert("Deleted", "Journal entry deleted successfully", "success");
        fetchJournals();
      } else {
        const data = await response.json();
        showAlert("Error", data.message || "Failed to delete entry", "error");
      }
    } catch (err) {
      console.error("Journal delete error:", err);
      showAlert("Error", "Network error. Please try again.", "error");
    }
  };

  const getMoodInfo = (mood?: string) => {
    return MOODS.find((m) => m.value === mood) || null;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatShortDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  if (loading && journals.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <i className="fas fa-spinner fa-spin text-4xl text-primary mb-4"></i>
          <p className="text-foreground">Loading your journal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <i className="fas fa-book text-primary"></i>
              My Journal
            </h1>
            <p className="text-foreground/70 mt-1">
              Record your thoughts, feelings, and fitness journey
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setIsFormOpen(true);
            }}
            className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 transition-all shadow-lg hover:shadow-xl"
          >
            <i className="fas fa-plus"></i>
            New Entry
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-500 px-4 py-3 rounded-xl mb-6">
            <i className="fas fa-exclamation-circle mr-2"></i>
            {error}
          </div>
        )}

        {/* Journal Form Modal */}
        {isFormOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-background border border-neutral rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-foreground">
                    {editingEntry ? "Edit Entry" : "New Journal Entry"}
                  </h2>
                  <button
                    onClick={resetForm}
                    className="text-foreground/60 hover:text-foreground transition-colors"
                  >
                    <i className="fas fa-times text-xl"></i>
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Date */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <i className="fas fa-calendar-alt mr-2 text-primary"></i>
                      Date
                    </label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={(e) => setFormDate(e.target.value)}
                      className="w-full px-4 py-3 bg-background border border-neutral rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-foreground"
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <i className="fas fa-heading mr-2 text-primary"></i>
                      Title (optional)
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="Give your entry a title..."
                      maxLength={200}
                      className="w-full px-4 py-3 bg-background border border-neutral rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-foreground/40"
                    />
                  </div>

                  {/* Mood */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <i className="fas fa-smile mr-2 text-primary"></i>
                      How are you feeling?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {MOODS.map((mood) => (
                        <button
                          key={mood.value}
                          type="button"
                          onClick={() =>
                            setFormMood(
                              formMood === mood.value ? "" : mood.value
                            )
                          }
                          className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${
                            formMood === mood.value
                              ? "bg-primary/20 border-primary text-primary"
                              : "border-neutral hover:border-primary/50 text-foreground"
                          }`}
                        >
                          <span className="text-lg">{mood.emoji}</span>
                          <span className="text-sm">{mood.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <i className="fas fa-pen mr-2 text-primary"></i>
                      Content *
                    </label>
                    <textarea
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      placeholder="What's on your mind? How was your workout? Any goals or reflections?"
                      rows={8}
                      maxLength={5000}
                      required
                      className="w-full px-4 py-3 bg-background border border-neutral rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-foreground/40 resize-none"
                    />
                    <p className="text-xs text-foreground/50 mt-1 text-right">
                      {formContent.length}/5000
                    </p>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-2">
                      <i className="fas fa-tags mr-2 text-primary"></i>
                      Tags (optional, comma-separated)
                    </label>
                    <input
                      type="text"
                      value={formTags}
                      onChange={(e) => setFormTags(e.target.value)}
                      placeholder="workout, motivation, goals..."
                      className="w-full px-4 py-3 bg-background border border-neutral rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent text-foreground placeholder:text-foreground/40"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-6 py-3 border border-neutral rounded-xl text-foreground hover:bg-neutral/20 transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting || !formContent.trim()}
                      className="flex-1 px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <i className="fas fa-spinner fa-spin"></i>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-save"></i>
                          {editingEntry ? "Update" : "Save Entry"}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Journal Entries */}
        {journals.length === 0 ? (
          <div className="text-center py-16 bg-background border border-neutral rounded-2xl">
            <i className="fas fa-book-open text-6xl text-foreground/30 mb-4"></i>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No journal entries yet
            </h3>
            <p className="text-foreground/60 mb-6">
              Start documenting your fitness journey today!
            </p>
            <button
              onClick={() => setIsFormOpen(true)}
              className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-full font-semibold inline-flex items-center gap-2 transition-all"
            >
              <i className="fas fa-plus"></i>
              Write Your First Entry
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {journals.map((entry) => {
              const moodInfo = getMoodInfo(entry.mood);
              const isExpanded = expandedEntry === entry._id;

              return (
                <div
                  key={entry._id}
                  className="bg-background border border-neutral rounded-2xl overflow-hidden hover:border-primary/30 transition-all"
                >
                  {/* Entry Header */}
                  <div
                    className="p-5 cursor-pointer"
                    onClick={() =>
                      setExpandedEntry(isExpanded ? null : entry._id)
                    }
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-sm text-foreground/60">
                            <i className="fas fa-calendar-alt mr-1"></i>
                            {formatDate(entry.date)}
                          </span>
                          {moodInfo && (
                            <span className={`text-lg`} title={moodInfo.label}>
                              {moodInfo.emoji}
                            </span>
                          )}
                        </div>
                        {entry.title && (
                          <h3 className="text-lg font-semibold text-foreground mb-1 truncate">
                            {entry.title}
                          </h3>
                        )}
                        <p className="text-foreground/70 line-clamp-2">
                          {entry.content}
                        </p>
                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {entry.tags.slice(0, 3).map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                            {entry.tags.length > 3 && (
                              <span className="text-xs px-2 py-1 bg-neutral/50 text-foreground/60 rounded-full">
                                +{entry.tags.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <i
                          className={`fas fa-chevron-${
                            isExpanded ? "up" : "down"
                          } text-foreground/40`}
                        ></i>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-neutral">
                      <div className="p-5">
                        <div className="prose prose-sm max-w-none text-foreground/80 whitespace-pre-wrap mb-4">
                          {entry.content}
                        </div>

                        {entry.tags && entry.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {entry.tags.map((tag, idx) => (
                              <span
                                key={idx}
                                className="text-xs px-3 py-1 bg-primary/10 text-primary rounded-full"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-neutral">
                          <span className="text-xs text-foreground/50">
                            Created {formatShortDate(entry.createdAt)}
                            {entry.updatedAt !== entry.createdAt && (
                              <> · Edited {formatShortDate(entry.updatedAt)}</>
                            )}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditForm(entry);
                              }}
                              className="px-4 py-2 text-sm bg-secondary/10 text-secondary rounded-lg hover:bg-secondary/20 transition-colors flex items-center gap-2"
                            >
                              <i className="fas fa-edit"></i>
                              Edit
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDelete(entry._id);
                              }}
                              className="px-4 py-2 text-sm bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors flex items-center gap-2"
                            >
                              <i className="fas fa-trash"></i>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-neutral rounded-lg text-foreground hover:bg-neutral/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            <span className="px-4 py-2 text-foreground">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(pagination.pages, p + 1))
              }
              disabled={currentPage === pagination.pages}
              className="px-4 py-2 border border-neutral rounded-lg text-foreground hover:bg-neutral/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        )}

        {/* Stats Summary */}
        {pagination && pagination.total > 0 && (
          <div className="mt-8 p-6 bg-background border border-neutral rounded-2xl">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <i className="fas fa-chart-bar text-primary"></i>
              Journal Stats
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-primary/10 rounded-xl">
                <p className="text-2xl font-bold text-primary">
                  {pagination.total}
                </p>
                <p className="text-sm text-foreground/60">Total Entries</p>
              </div>
              <div className="text-center p-4 bg-secondary/10 rounded-xl">
                <p className="text-2xl font-bold text-secondary">
                  {journals.filter((j) => j.mood).length}
                </p>
                <p className="text-sm text-foreground/60">With Mood</p>
              </div>
              <div className="text-center p-4 bg-success/10 rounded-xl">
                <p className="text-2xl font-bold text-success">
                  {journals.filter((j) => j.tags && j.tags.length > 0).length}
                </p>
                <p className="text-sm text-foreground/60">Tagged</p>
              </div>
              <div className="text-center p-4 bg-warning/10 rounded-xl">
                <p className="text-2xl font-bold text-warning">
                  {Math.round(
                    journals.reduce((acc, j) => acc + j.content.length, 0) /
                      Math.max(journals.length, 1)
                  )}
                </p>
                <p className="text-sm text-foreground/60">Avg. Characters</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
