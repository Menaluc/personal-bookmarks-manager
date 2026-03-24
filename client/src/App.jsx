import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

function App() {
  const [url, setUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");

  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  async function fetchBookmarks() {
    try {
      setLoading(true);
      setError("");
     
      const response = await fetch(`${API_BASE}/bookmarks`);
      if (!response.ok) {
        throw new Error("Failed to load bookmarks");
      }

      const data = await response.json();
      console.log("bookmarks from server:",data);
      setBookmarks(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleAddBookmark(e) {
    e.preventDefault();
  
    const trimmedUrl = url.trim();
    if (!trimmedUrl) return;
  
    const tags = tagsInput
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  
    try {
      setSubmitting(true);
      setError("");
  
      if (editingId) {
        const response = await fetch(`${API_BASE}/bookmarks/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: trimmedUrl,
            tags,
          }),
        });
  
        if (!response.ok) {
          throw new Error("Failed to update bookmark");
        }
  
        const updatedBookmark = await response.json();
  
        setBookmarks((prev) =>
          prev.map((bookmark) =>
            bookmark.id === editingId ? updatedBookmark : bookmark
          )
        );
  
        setEditingId(null);
      } else {
        const response = await fetch(`${API_BASE}/bookmarks`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url: trimmedUrl,
            tags,
          }),
        });
  
        if (!response.ok) {
          throw new Error("Failed to add bookmark");
        }
  
        const createdBookmark = await response.json();
        setBookmarks((prev) => [createdBookmark, ...prev]);
      }
  
      setUrl("");
      setTagsInput("");
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteBookmark(id) {
    try {
      setError("");

      const response = await fetch(`${API_BASE}/bookmarks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete bookmark");
      }

      setBookmarks((prev) => prev.filter((bookmark) => bookmark.id !== id));
    } catch (err) {
      setError(err.message || "Something went wrong");
    }
  }


  function handleStartEdit(bookmark) {
    setEditingId(bookmark.id);
    setUrl(bookmark.url || "");
    setTagsInput(Array.isArray(bookmark.tags) ? bookmark.tags.join(", ") : "");
    }
    

  const allTags = useMemo(() => {
    const tagsSet = new Set();

    bookmarks.forEach((bookmark) => {
      const bookmarkTags = Array.isArray(bookmark.tags) ? bookmark.tags : [];
      bookmarkTags.forEach((tag) => tagsSet.add(tag));
    });

    return Array.from(tagsSet);
  }, [bookmarks]);

  const filteredBookmarks = useMemo(() => {
    const term = search.toLowerCase().trim();

    return bookmarks.filter((bookmark) => {
      const title = (bookmark.title || "").toLowerCase();
      const bookmarkUrl = (bookmark.url || "").toLowerCase();
      const description = (bookmark.description || "").toLowerCase();
      const bookmarkTags = Array.isArray(bookmark.tags) ? bookmark.tags : [];

      const matchesSearch =
        !term ||
        title.includes(term) ||
        bookmarkUrl.includes(term) ||
        description.includes(term);

      const matchesTag =
        selectedTag === "all" || bookmarkTags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [bookmarks, search, selectedTag]);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1 style={styles.mainTitle}>Personal Bookmarks Manager</h1>
          <p style={styles.subtitle}>
            Save links, auto-fetch metadata, and organize with tags.
          </p>
        </header>

        <section style={styles.card}>
          <h2 style={styles.sectionTitle}>
             {editingId ? "Edit bookmark" : "Add bookmark"}
         </h2>

          <form onSubmit={handleAddBookmark}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>URL</label>
              <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={styles.input}
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Tags (comma separated)</label>
              <input
                type="text"
                placeholder="work, docs, reading"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                style={styles.input}
              />
            </div>
            <div style={styles.formActions}>
  <button type="submit" style={styles.primaryButton} disabled={submitting}>
    {submitting
      ? editingId
        ? "Saving..."
        : "Adding..."
      : editingId
      ? "Save changes"
      : "Add bookmark"}
  </button>

  {editingId && (
    <button
      type="button"
      onClick={() => {
        setEditingId(null);
        setUrl("");
        setTagsInput("");
      }}
      style={styles.cancelButton}
    >
      Cancel
    </button>
  )}
</div>
          </form>
        </section>

        <section style={styles.card}>
          <div style={styles.filtersRow}>
            <input
              type="text"
              placeholder="Search by title, description, or URL"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />

            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              style={styles.select}
            >
              <option value="all">All tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </section>

        {error && <div style={styles.errorBox}>{error}</div>}

        <section>
          {loading ? (
            <div style={styles.emptyState}>Loading bookmarks...</div>
          ) : filteredBookmarks.length === 0 ? (
            <div style={styles.emptyState}>No bookmarks found.</div>
          ) : (
            <div style={styles.bookmarksList}>
              {filteredBookmarks.map((bookmark) => {
                const bookmarkTags = Array.isArray(bookmark.tags)
                  ? bookmark.tags
                  : [];

                return (
                  <article key={bookmark.id} style={styles.bookmarkCard}>
                    <div style={styles.bookmarkHeader}>
                      <div>
                        <h3 style={styles.bookmarkTitle}>
                          {bookmark.title || bookmark.url}
                        </h3>
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noreferrer"
                          style={styles.bookmarkLink}
                        >
                          {bookmark.url}
                        </a>
                      </div>

                      <div style={styles.actions}>
                        <button
                          onClick={() => handleStartEdit(bookmark)}
                          style={styles.editButton}
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => handleDeleteBookmark(bookmark.id)}
                          style={styles.deleteButton}
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <p style={styles.bookmarkDescription}>
                      {bookmark.description || "No description"}
                    </p>

                    <div style={styles.tagsRow}>
                      {bookmarkTags.length > 0 ? (
                        bookmarkTags.map((tag) => (
                          <span key={tag} style={styles.tagChip}>
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span style={styles.noTagsText}>No tags</span>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f3f4f6",
    padding: "16px",
    fontFamily: "Inter, Arial, sans-serif",
  },
  container: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    marginBottom: "18px",
  },
  mainTitle: {
    margin: 0,
    fontSize: "2rem",
    fontWeight: "700",
    color: "#0f172a",
  },
  subtitle: {
    marginTop: "8px",
    marginBottom: 0,
    color: "#475569",
    fontSize: "1rem",
  },
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: "16px",
    padding: "18px",
    marginBottom: "18px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  sectionTitle: {
    marginTop: 0,
    marginBottom: "20px",
    fontSize: "1.1rem",
    color: "#0f172a",
  },
  fieldGroup: {
    marginBottom: "16px",
  },
  label: {
    display: "block",
    marginBottom: "8px",
    fontSize: "0.95rem",
    color: "#1e293b",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "1rem",
    outline: "none",
    boxSizing: "border-box",
  },
  primaryButton: {
    backgroundColor: "#2563eb",
    color: "#ffffff",
    border: "none",
    borderRadius: "12px",
    padding: "12px 18px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
  },
  filtersRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
  },
  searchInput: {
    flex: 1,
    minWidth: "260px",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "1rem",
    outline: "none",
    boxSizing: "border-box",
  },
  select: {
    width: "180px",
    padding: "12px 14px",
    borderRadius: "12px",
    border: "1px solid #cbd5e1",
    fontSize: "1rem",
    backgroundColor: "#fff",
  },
  emptyState: {
    backgroundColor: "#ffffff",
    border: "1px dashed #cbd5e1",
    borderRadius: "16px",
    padding: "28px",
    textAlign: "center",
    color: "#475569",
  },
  bookmarksList: {
    display: "grid",
    gap: "16px",
  },
  bookmarkCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: "16px",
    padding: "18px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  bookmarkHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: "16px",
    alignItems: "flex-start",
    flexWrap: "wrap",
  },
  bookmarkTitle: {
    margin: 0,
    fontSize: "1.1rem",
    color: "#0f172a",
  },
  bookmarkLink: {
    display: "inline-block",
    marginTop: "8px",
    color: "#2563eb",
    textDecoration: "none",
    wordBreak: "break-all",
  },
  bookmarkDescription: {
    marginTop: "14px",
    marginBottom: "14px",
    color: "#475569",
  },
  tagsRow: {
    display: "flex",
    gap: "8px",
    flexWrap: "wrap",
  },
  tagChip: {
    backgroundColor: "#e0e7ff",
    color: "#3730a3",
    borderRadius: "999px",
    padding: "6px 10px",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  noTagsText: {
    color: "#94a3b8",
    fontSize: "0.9rem",
  },
  deleteButton: {
    backgroundColor: "#ef4444",
    color: "#fff",
    border: "none",
    borderRadius: "10px",
    padding: "10px 14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  formActions: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  
  actions: {
    display: "flex",
    gap: "8px",
  },
  
  editButton: {
    backgroundColor: "#f59e0b",
    color: "#rgb(161, 225, 212)",
    border: "none",
    borderRadius: "10px",
    padding: "10px 14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  
  cancelButton: {
    backgroundColor: "#e5e7eb",
    color: "#111827",
    border: "none",
    borderRadius: "12px",
    padding: "12px 18px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
  },

  errorBox: {
    backgroundColor: "#fee2e2",
    color: "#991b1b",
    border: "1px solid #fecaca",
    borderRadius: "12px",
    padding: "12px 14px",
    marginBottom: "16px",
  },
};

export default App;