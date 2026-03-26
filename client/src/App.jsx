import { useEffect, useMemo, useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "/api";

async function errorMessageFromResponse(response) {
  try {
    const data = await response.json();
    if (data?.error?.message) return data.error.message;
  } catch {
    // ignore parse errors
  }
  return `Request failed (${response.status})`;
}

function App() {
  const [url, setUrl] = useState("");
  const [tagsInput, setTagsInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [descriptionInput, setDescriptionInput] = useState("");
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");

  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  useEffect(() => {
    fetchBookmarks();
  }, []);

  function resetEditForm() {
    setEditingId(null);
    setUrl("");
    setTagsInput("");
    setTitleInput("");
    setDescriptionInput("");
  }

  async function fetchBookmarks() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE}/bookmarks`);
      if (!response.ok) {
        throw new Error(await errorMessageFromResponse(response));
      }

      const data = await response.json();
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
            title: titleInput.trim(),
            description: descriptionInput.trim(),
            tags,
          }),
        });

        if (!response.ok) {
          throw new Error(await errorMessageFromResponse(response));
        }

        const updatedBookmark = await response.json();

        setBookmarks((prev) =>
          prev.map((bookmark) =>
            bookmark.id === editingId ? updatedBookmark : bookmark
          )
        );

        resetEditForm();
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
          throw new Error(await errorMessageFromResponse(response));
        }

        const createdBookmark = await response.json();
        setBookmarks((prev) => [createdBookmark, ...prev]);
        setUrl("");
        setTagsInput("");
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmDelete() {
    if (deleteTargetId == null) return;

    try {
      setError("");

      const response = await fetch(`${API_BASE}/bookmarks/${deleteTargetId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(await errorMessageFromResponse(response));
      }

      setBookmarks((prev) =>
        prev.filter((bookmark) => bookmark.id !== deleteTargetId)
      );
      setDeleteTargetId(null);
    } catch (err) {
      setError(err.message || "Something went wrong");
      setDeleteTargetId(null);
    }
  }

  function handleStartEdit(bookmark) {
    setEditingId(bookmark.id);
    setUrl(bookmark.url || "");
    setTitleInput(bookmark.title || "");
    setDescriptionInput(bookmark.description || "");
    setTagsInput(
      Array.isArray(bookmark.tags) ? bookmark.tags.join(", ") : ""
    );
  }

  const allTags = useMemo(() => {
    const tagsSet = new Set();

    bookmarks.forEach((bookmark) => {
      const bookmarkTags = Array.isArray(bookmark.tags) ? bookmark.tags : [];
      bookmarkTags.forEach((tag) => tagsSet.add(tag));
    });

    return Array.from(tagsSet).sort();
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

  const inputClass =
    "w-full rounded-2xl border border-slate-200 bg-white px-3.5 py-3 text-base text-slate-900 outline-none placeholder:text-slate-400 focus:border-sky-300 focus:ring-4 focus:ring-sky-100 box-border transition-colors";

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-4 font-sans text-slate-900 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6 sm:mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Personal Bookmarks Manager
          </h1>
          <p className="mt-1 text-sm text-slate-500 sm:text-base">
            Save links, auto-fetch metadata, and organize with tags.
          </p>
        </header>

        <section className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="mb-4 text-lg font-medium text-slate-700">
            {editingId ? "Edit bookmark" : "Add bookmark"}
          </h2>

          <form onSubmit={handleAddBookmark} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                URL
              </label>
              <input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className={inputClass}
              />
            </div>

            {editingId ? (
              <>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Title
                  </label>
                  <input
                    type="text"
                    value={titleInput}
                    onChange={(e) => setTitleInput(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    value={descriptionInput}
                    onChange={(e) => setDescriptionInput(e.target.value)}
                    rows={3}
                    className={inputClass + " resize-y min-h-[5rem]"}
                  />
                </div>
              </>
            ) : null}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">
                Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="work, docs, reading"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="flex flex-wrap gap-2.5">
              <button
                type="submit"
                disabled={submitting}
                className="rounded-2xl bg-sky-400 px-4 py-3 text-base font-semibold text-white shadow-sm shadow-sky-200/50 hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60 transition-colors focus:ring-4 focus:ring-sky-100"
              >
                {submitting
                  ? editingId
                    ? "Saving..."
                    : "Adding..."
                  : editingId
                    ? "Save changes"
                    : "Add bookmark"}
              </button>

              {editingId ? (
                <button
                  type="button"
                  onClick={resetEditForm}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100 transition-colors focus:ring-4 focus:ring-slate-100"
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </section>

        <section className="mb-4 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <input
              type="text"
              placeholder="Search by title, description, or URL"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`${inputClass} sm:min-w-0 sm:flex-1`}
            />

            <select
              value={selectedTag}
              onChange={(e) => setSelectedTag(e.target.value)}
              className={`${inputClass} sm:w-48 sm:flex-none`}
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

        {error ? (
          <div
            className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {error}
          </div>
        ) : null}

        <section>
          {loading ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-10 text-center text-slate-500">
              Loading bookmarks...
            </div>
          ) : filteredBookmarks.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white py-10 text-center text-slate-500">
              No bookmarks found.
            </div>
          ) : (
            <ul className="grid list-none gap-4 p-0 sm:grid-cols-1">
              {filteredBookmarks.map((bookmark) => {
                const bookmarkTags = Array.isArray(bookmark.tags)
                  ? bookmark.tags
                  : [];

                return (
                  <li
                    key={bookmark.id}
                    className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md sm:p-5"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {bookmark.title || bookmark.url}
                        </h3>
                        <a
                          href={bookmark.url}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-1 inline-block break-all text-sm text-sky-700 hover:underline"
                        >
                          {bookmark.url}
                        </a>
                      </div>

                      <div className="flex shrink-0 flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(bookmark)}
                          className="rounded-2xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 hover:bg-indigo-100 transition-colors focus:ring-4 focus:ring-indigo-100"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => setDeleteTargetId(bookmark.id)}
                          className="rounded-2xl bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors focus:ring-4 focus:ring-red-100"
                        >
                          Delete
                        </button>
                      </div>
                    </div>

                    <p className="my-3 text-sm text-slate-600">
                      {bookmark.description || "No description"}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {bookmarkTags.length > 0 ? (
                        bookmarkTags.map((tag) => (
                          <span
                            key={`${bookmark.id}-${tag}`}
                            className="inline-flex rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sm font-medium text-sky-700"
                          >
                            {tag}
                          </span>
                        ))
                      ) : (
                        <span className="text-sm text-slate-400">No tags</span>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>

      {deleteTargetId != null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="w-full max-w-sm rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
            <h3
              id="delete-dialog-title"
              className="text-lg font-semibold text-slate-900"
            >
              Delete bookmark?
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTargetId(null)}
                className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors focus:ring-4 focus:ring-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="rounded-2xl bg-red-500 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600 transition-colors focus:ring-4 focus:ring-red-100"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default App;
