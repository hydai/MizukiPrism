---
name: sync-data
description: Commit and push song/stream data changes after importing a new stream. Use when the user says "sync data", "commit the stream", "push stream data", or after running eximport.
user-invocable: true
argument-hint: "[--no-push]"
---

# Sync Data

Analyze changes in `data/songs.json` and `data/streams.json`, generate a commit message, commit, and push.

## Steps

1. **Check for changes** — Run `git status` and `git diff` on `data/songs.json` and `data/streams.json`. If there are no changes to these files, tell the user and stop.

2. **Analyze the diff** — Extract the following from the diff:
   - **New streams**: Parse added entries in `streams.json` to get stream date(s) and title(s). Extract a short label from the title (e.g. `深夜歌枠`, `午後歌枠`, `朝歌枠`) — look for the text inside the first `【...】` bracket pair.
   - **Performance count**: Count how many new performance objects were added to `songs.json` by counting occurrences of the new `streamId` in the diff.
   - **New songs**: Check if any entirely new song entries (top-level objects with a new `songId`) were added, not just new performances under existing songs.

3. **Generate commit message** — Follow project conventions:
   - Format: `feat: add stream <date> <short-title> with <N> performances`
   - If new songs were also added: `feat: add stream <date> <short-title> with <N> performances (<M> new songs)`
   - If multiple streams are added in one commit, list them: `feat: add streams <date1> <title1> and <date2> <title2> with <N> total performances`

4. **Stage and commit** — Stage only `data/songs.json` and `data/streams.json`. Create the commit with the generated message. Include `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`.

5. **Push** — Push to `origin` unless the user passed `--no-push` as an argument. If `$ARGUMENTS` contains `--no-push`, skip the push step and tell the user the commit was created locally.

6. **Report** — Show the commit hash, message, and whether it was pushed.
