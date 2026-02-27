/* MizukiLens EndStamp Editor — Frontend Logic */

(function () {
  "use strict";

  // --- State ---
  let player = null;
  let playerReady = false;
  let currentVideoId = null;
  let songs = [];
  let selectedIndex = -1;

  // --- DOM refs ---
  const $streams = document.getElementById("streams");
  const $songs = document.getElementById("songs");
  const $songCount = document.getElementById("song-count");
  const $stats = document.getElementById("stats");
  const $btnMark = document.getElementById("btn-mark");
  const $btnSeek = document.getElementById("btn-seek");
  const $btnFetch = document.getElementById("btn-fetch");
  const $btnClearAll = document.getElementById("btn-clear-all");
  const $placeholder = document.getElementById("player-placeholder");

  // --- Helpers ---

  function clearChildren(el) {
    while (el.firstChild) el.removeChild(el.firstChild);
  }

  function secondsToTimestamp(sec) {
    sec = Math.floor(sec);
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    if (h > 0) {
      return h + ":" + String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
    }
    return m + ":" + String(s).padStart(2, "0");
  }

  function formatDuration(sec) {
    var m = Math.floor(sec / 60);
    var s = sec % 60;
    return m + ":" + String(s).padStart(2, "0");
  }

  function timestampToSeconds(ts) {
    if (!ts) return 0;
    const parts = ts.split(":").map(Number);
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    return parts[0] || 0;
  }

  function showToast(msg, isError) {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.toggle("error", !!isError);
    toast.classList.add("show");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () { toast.classList.remove("show"); }, 2000);
  }

  async function fetchJSON(url, opts) {
    const res = await fetch(url, opts);
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data;
  }

  // --- Stats ---

  async function loadStats() {
    try {
      const data = await fetchJSON("/api/stats");
      $stats.textContent = data.filled + "/" + data.total + " stamped (" + data.remaining + " remaining)";
    } catch (e) {
      $stats.textContent = "";
    }
  }

  // --- Stream list ---

  async function loadStreams() {
    const data = await fetchJSON("/api/streams");
    clearChildren($streams);
    data.forEach(function (s) {
      const li = document.createElement("li");
      li.dataset.videoId = s.videoId;

      const title = document.createElement("div");
      title.className = "stream-title";
      title.textContent = s.title || s.videoId;

      const meta = document.createElement("div");
      meta.className = "stream-meta";

      const date = document.createElement("span");
      date.textContent = s.date || "no date";

      const badge = document.createElement("span");
      badge.className = "badge" + (s.pending === 0 ? " badge-zero" : "");
      badge.textContent = s.pending;

      const status = document.createElement("span");
      status.textContent = s.status;

      meta.append(date, badge, status);
      li.append(title, meta);
      li.addEventListener("click", function () { selectStream(s.videoId); });
      $streams.appendChild(li);
    });
  }

  function selectStream(videoId) {
    currentVideoId = videoId;
    // Highlight active
    $streams.querySelectorAll("li").forEach(function (li) {
      li.classList.toggle("active", li.dataset.videoId === videoId);
    });
    loadPlayer(videoId);
    loadSongs(videoId);
  }

  // --- YouTube Player ---

  function loadPlayer(videoId) {
    $placeholder.style.display = "none";
    if (player && playerReady) {
      player.loadVideoById(videoId);
    } else {
      player = new YT.Player("player", {
        height: "300",
        width: "100%",
        videoId: videoId,
        playerVars: { autoplay: 0, rel: 0 },
        events: {
          onReady: function () {
            playerReady = true;
          },
        },
      });
    }
  }

  // --- Song list ---

  async function loadSongs(videoId) {
    songs = await fetchJSON("/api/streams/" + encodeURIComponent(videoId) + "/songs");
    selectedIndex = songs.length > 0 ? 0 : -1;
    renderSongs();
    updateControls();
  }

  function renderSongs() {
    clearChildren($songs);
    const pending = songs.filter(function (s) { return !s.endTimestamp; }).length;
    $songCount.textContent = pending > 0 ? pending + " pending" : "all done";
    $songCount.className = "badge" + (pending === 0 ? " badge-zero" : "");

    songs.forEach(function (s, i) {
      const li = document.createElement("li");
      li.className = i === selectedIndex ? "selected" : "";
      li.addEventListener("click", function () {
        selectedIndex = i;
        renderSongs();
        updateControls();
      });

      const idx = document.createElement("span");
      idx.className = "song-index";
      idx.textContent = "#" + (s.orderIndex + 1);

      const name = document.createElement("span");
      name.className = "song-name";

      var nameText = document.createElement("span");
      nameText.className = "song-name-text";
      nameText.textContent = s.songName;
      nameText.title = "Double-click to edit song name";
      nameText.addEventListener("dblclick", function (e) {
        e.stopPropagation();
        startInlineEdit(nameText, i, "songName");
      });
      name.appendChild(nameText);

      if (s.artist) {
        var sep = document.createElement("span");
        sep.className = "song-separator";
        sep.textContent = " \u2014 ";
        name.appendChild(sep);

        var artistText = document.createElement("span");
        artistText.className = "song-artist-text";
        artistText.textContent = s.artist;
        artistText.title = "Double-click to edit artist";
        artistText.addEventListener("dblclick", function (e) {
          e.stopPropagation();
          startInlineEdit(artistText, i, "artist");
        });
        name.appendChild(artistText);
      }

      const start = document.createElement("span");
      start.className = "song-start";
      start.textContent = s.startTimestamp;

      const dur = document.createElement("span");
      dur.className = "song-duration";
      dur.textContent = s.duration ? formatDuration(s.duration) : "";

      const end = document.createElement("span");
      end.className = "song-end " + (s.endTimestamp ? "filled" : "empty");
      end.textContent = s.endTimestamp || "\u2014";

      li.append(idx, name, start, dur, end);

      if (s.endTimestamp) {
        const undo = document.createElement("button");
        undo.className = "btn-undo";
        undo.textContent = "\u21BA";
        undo.title = "Clear end timestamp";
        undo.addEventListener("click", function (e) {
          e.stopPropagation();
          clearEndTimestamp(s.id, i);
        });
        li.appendChild(undo);
      }

      $songs.appendChild(li);
    });
  }

  // --- Inline editing ---

  function startInlineEdit(span, songIndex, field) {
    var original = span.textContent;
    var input = document.createElement("input");
    input.type = "text";
    input.className = "inline-edit";
    input.value = original;

    span.textContent = "";
    span.appendChild(input);
    input.focus();
    input.select();

    var committed = false;

    function commit() {
      if (committed) return;
      committed = true;
      var value = input.value.trim();
      if (!value || value === original) {
        cancel();
        return;
      }
      saveInlineEdit(songIndex, field, value);
    }

    function cancel() {
      if (span.contains(input)) {
        span.textContent = original;
      }
    }

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); commit(); }
      if (e.key === "Escape") { e.preventDefault(); cancel(); }
    });

    input.addEventListener("blur", function () {
      if (!committed) cancel();
    });
  }

  async function saveInlineEdit(songIndex, field, value) {
    var song = songs[songIndex];
    var body = {};
    body[field] = value;
    try {
      var data = await fetchJSON("/api/songs/" + song.id + "/details", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      song.songName = data.songName;
      song.artist = data.artist;
      renderSongs();
      showToast("Updated " + field);
    } catch (e) {
      showToast("Error: " + e.message, true);
      renderSongs();
    }
  }

  function updateControls() {
    const hasSong = selectedIndex >= 0 && selectedIndex < songs.length;
    $btnMark.disabled = !hasSong;
    $btnSeek.disabled = !hasSong;
    $btnFetch.disabled = !hasSong;
    $btnClearAll.disabled = !currentVideoId;
  }

  // --- API actions ---

  async function markEndTimestamp() {
    if (selectedIndex < 0 || !player || !playerReady) return;
    const song = songs[selectedIndex];
    const currentTime = player.getCurrentTime();
    const ts = secondsToTimestamp(currentTime);

    try {
      await fetchJSON("/api/songs/" + song.id + "/end-timestamp", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endTimestamp: ts }),
      });
      song.endTimestamp = ts;
      song.manualEndTs = true;
      renderSongs();
      loadStats();
      showToast("Marked " + song.songName + " \u2192 " + ts);

      // Auto-advance to next unstamped song
      var nextIdx = -1;
      for (var j = selectedIndex + 1; j < songs.length; j++) {
        if (!songs[j].endTimestamp) { nextIdx = j; break; }
      }
      if (nextIdx >= 0) {
        selectedIndex = nextIdx;
        renderSongs();
        updateControls();
      }
    } catch (e) {
      showToast("Error: " + e.message, true);
    }
  }

  async function clearEndTimestamp(songId, idx) {
    try {
      await fetchJSON("/api/songs/" + songId + "/end-timestamp", {
        method: "DELETE",
      });
      songs[idx].endTimestamp = null;
      songs[idx].manualEndTs = false;
      renderSongs();
      loadStats();
      showToast("Cleared end timestamp");
    } catch (e) {
      showToast("Error: " + e.message, true);
    }
  }

  async function clearAllEndTimestamps() {
    if (!currentVideoId) return;
    if (!confirm("Clear all end timestamps for this stream?")) return;
    try {
      var data = await fetchJSON("/api/streams/" + encodeURIComponent(currentVideoId) + "/end-timestamps", {
        method: "DELETE",
      });
      await loadSongs(currentVideoId);
      loadStats();
      showToast("Cleared " + data.cleared + " end timestamps");
    } catch (e) {
      showToast("Error: " + e.message, true);
    }
  }

  function seekToStart() {
    if (selectedIndex < 0 || !player || !playerReady) return;
    const song = songs[selectedIndex];
    const sec = timestampToSeconds(song.startTimestamp);
    player.seekTo(sec, true);
  }

  async function fetchDuration() {
    if (selectedIndex < 0) return;
    const song = songs[selectedIndex];
    $btnFetch.disabled = true;
    showToast("Fetching duration\u2026");
    try {
      var data = await fetchJSON("/api/songs/" + song.id + "/fetch-duration", {
        method: "POST",
      });
      if (data.duration) {
        song.duration = data.duration;
        renderSongs();
        showToast("Duration: " + formatDuration(data.duration));
      } else {
        showToast(data.message || "No iTunes match");
      }
    } catch (e) {
      showToast("Error: " + e.message, true);
    } finally {
      $btnFetch.disabled = false;
    }
  }

  function selectNext() {
    if (songs.length === 0) return;
    selectedIndex = Math.min(selectedIndex + 1, songs.length - 1);
    renderSongs();
    updateControls();
  }

  function selectPrev() {
    if (songs.length === 0) return;
    selectedIndex = Math.max(selectedIndex - 1, 0);
    renderSongs();
    updateControls();
  }

  // --- Keyboard shortcuts ---

  document.addEventListener("keydown", function (e) {
    // Don't capture if user is typing in an input
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;

    switch (e.key) {
      case "m":
        markEndTimestamp();
        break;
      case "s":
        seekToStart();
        break;
      case "f":
        fetchDuration();
        break;
      case "n":
        selectNext();
        break;
      case "p":
        selectPrev();
        break;
      case "ArrowLeft":
        if (playerReady && player) {
          e.preventDefault();
          player.seekTo(player.getCurrentTime() - 5, true);
        }
        break;
      case "ArrowRight":
        if (playerReady && player) {
          e.preventDefault();
          player.seekTo(player.getCurrentTime() + 5, true);
        }
        break;
    }
  });

  // --- Button handlers ---
  $btnMark.addEventListener("click", markEndTimestamp);
  $btnSeek.addEventListener("click", seekToStart);
  $btnFetch.addEventListener("click", fetchDuration);
  $btnClearAll.addEventListener("click", clearAllEndTimestamps);

  // --- Init ---
  loadStats();
  loadStreams();
})();
