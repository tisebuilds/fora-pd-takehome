"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Dialog } from "@base-ui/react/dialog";
import { Mic, PenLine, Pencil, Square, Trash2, Upload } from "lucide-react";
import { toast } from "sonner";
import type { Client, ClientProfileNote } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const TEXT_FIELD =
  "min-h-[160px] w-full min-w-0 rounded-md border-fora-border bg-white px-3 py-2.5 text-[15px] text-fora-navy shadow-none outline-none transition-colors placeholder:text-fora-muted focus-visible:border-fora-border focus-visible:ring-2 focus-visible:ring-fora-border/60";

const toolbarBtnClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-fora-border bg-white px-3.5 text-[14px] font-medium text-fora-navy outline-none transition-colors hover:bg-fora-app focus-visible:ring-2 focus-visible:ring-black/15 disabled:pointer-events-none disabled:opacity-50";

/** Shown under meeting recordings in this demo (not from real transcription). */
const DEMO_MEETING_NOTES_TEXT = `Auto-generated meeting notes (demo, not from real speech):

• Reviewed upcoming travel and any open questions from the client.
• Captured preferences for timing, routing, and seating when discussed.
• Placeholder follow-ups: confirm rates, share an itinerary draft, and double-check passport validity before ticketing.`;

function pickRecorderMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  for (const c of candidates) {
    if (MediaRecorder.isTypeSupported(c)) return c;
  }
  return undefined;
}

export function getServerProfileNotes(client: Client): ClientProfileNote[] {
  if (client.profileNotes && client.profileNotes.length > 0) {
    return client.profileNotes.map((n) => ({ ...n }));
  }
  const legacy = client.notes?.trim();
  if (legacy) {
    return [
      {
        id: `profile-note-legacy-${client.id}`,
        kind: "text",
        createdAt: "2019-01-01T12:00:00.000Z",
        text: legacy,
      },
    ];
  }
  return [];
}

function formatNoteTimestamp(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

function noteKindHeading(note: ClientProfileNote): string {
  switch (note.kind) {
    case "text":
      return "Written note";
    case "audio_upload":
      return note.audioFileName ? `Audio · ${note.audioFileName}` : "Audio upload";
    case "audio_meeting":
      return "Meeting recording";
    default:
      return "Note";
  }
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `note-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

type Props = {
  client: Client;
};

export function ClientProfileNotesTab({ client }: Props) {
  const reactId = useId();
  const serverNotes = getServerProfileNotes(client);
  const [localByClient, setLocalByClient] = useState<Record<string, ClientProfileNote[]>>({});
  const [writtenOpen, setWrittenOpen] = useState(false);
  const [writtenMode, setWrittenMode] = useState<"add" | "edit">("add");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [writtenDraft, setWrittenDraft] = useState("");
  const [recording, setRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaChunksRef = useRef<Blob[]>([]);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const recordTickRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const urlRegistry = useRef(new Set<string>());

  const registerObjectUrl = useCallback((blob: Blob): string => {
    const url = URL.createObjectURL(blob);
    urlRegistry.current.add(url);
    return url;
  }, []);

  const revokeObjectUrl = useCallback((url: string | undefined) => {
    if (!url) return;
    URL.revokeObjectURL(url);
    urlRegistry.current.delete(url);
  }, []);

  useEffect(
    () => () => {
      for (const u of urlRegistry.current) {
        URL.revokeObjectURL(u);
      }
      urlRegistry.current.clear();
    },
    [],
  );

  const cards = localByClient[client.id] ?? serverNotes;
  const sortedCards = [...cards].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const appendNote = useCallback(
    (note: ClientProfileNote) => {
      setLocalByClient((prev) => {
        const base = prev[client.id] ?? getServerProfileNotes(client);
        return { ...prev, [client.id]: [note, ...base] };
      });
    },
    [client],
  );

  const removeNote = useCallback(
    (noteId: string) => {
      setLocalByClient((prev) => {
        const base = prev[client.id] ?? getServerProfileNotes(client);
        const victim = base.find((n) => n.id === noteId);
        if (victim?.audioObjectUrl) revokeObjectUrl(victim.audioObjectUrl);
        return { ...prev, [client.id]: base.filter((n) => n.id !== noteId) };
      });
    },
    [client, revokeObjectUrl],
  );

  const clearRecordInterval = () => {
    if (recordTickRef.current) {
      clearInterval(recordTickRef.current);
      recordTickRef.current = null;
    }
  };

  const stopMediaTracks = () => {
    mediaStreamRef.current?.getTracks().forEach((t) => t.stop());
    mediaStreamRef.current = null;
  };

  const stopMeetingRecording = useCallback(() => {
    const mr = mediaRecorderRef.current;
    if (mr && mr.state !== "inactive") {
      mr.stop();
    }
    mediaRecorderRef.current = null;
    setRecording(false);
    clearRecordInterval();
    setRecordSeconds(0);
  }, []);

  useEffect(() => {
    clearRecordInterval();
    const mr = mediaRecorderRef.current;
    if (mr) {
      mr.ondataavailable = null;
      mr.onstop = null;
      if (mr.state !== "inactive") {
        try {
          mr.stop();
        } catch {
          /* ignore */
        }
      }
      mediaRecorderRef.current = null;
    }
    stopMediaTracks();
    setRecording(false);
    setRecordSeconds(0);
  }, [client.id]);

  useEffect(() => {
    return () => {
      clearRecordInterval();
      const mr = mediaRecorderRef.current;
      if (mr) {
        mr.ondataavailable = null;
        mr.onstop = null;
        if (mr.state !== "inactive") {
          try {
            mr.stop();
          } catch {
            /* ignore */
          }
        }
      }
      mediaRecorderRef.current = null;
      stopMediaTracks();
    };
  }, []);

  useEffect(() => {
    if (!recording) return;
    recordTickRef.current = setInterval(() => {
      setRecordSeconds((s) => s + 1);
    }, 1000);
    return () => {
      clearRecordInterval();
    };
  }, [recording]);

  const startMeetingRecording = async () => {
    if (typeof window === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      toast.error("Recording is not supported in this environment.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      mediaChunksRef.current = [];
      const mimeType = pickRecorderMimeType();
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mr.ondataavailable = (ev) => {
        if (ev.data.size > 0) mediaChunksRef.current.push(ev.data);
      };
      mr.onstop = () => {
        stopMediaTracks();
        const blob = new Blob(mediaChunksRef.current, {
          type: mr.mimeType || mimeType || "audio/webm",
        });
        if (blob.size === 0) {
          toast.error("No audio captured. Try again.");
          return;
        }
        const audioObjectUrl = registerObjectUrl(blob);
        appendNote({
          id: newId(),
          kind: "audio_meeting",
          createdAt: new Date().toISOString(),
          audioObjectUrl,
          text: DEMO_MEETING_NOTES_TEXT,
        });
        toast.success("Meeting recording saved");
      };
      mediaRecorderRef.current = mr;
      mr.start(400);
      setRecordSeconds(0);
      setRecording(true);
    } catch {
      toast.error("Microphone access is required to record a meeting note.");
    }
  };

  const onUploadAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("audio/")) {
      toast.error("Please choose an audio file.");
      return;
    }
    const audioObjectUrl = registerObjectUrl(file);
    appendNote({
      id: newId(),
      kind: "audio_upload",
      createdAt: new Date().toISOString(),
      audioFileName: file.name,
      audioObjectUrl,
    });
    toast.success("Audio note added");
  };

  const openWrittenDialog = () => {
    setWrittenMode("add");
    setEditingNoteId(null);
    setWrittenDraft("");
    setWrittenOpen(true);
  };

  const openEditWrittenNote = (note: ClientProfileNote) => {
    if (note.kind !== "text") return;
    setWrittenMode("edit");
    setEditingNoteId(note.id);
    setWrittenDraft(note.text ?? "");
    setWrittenOpen(true);
  };

  const saveWrittenNote = () => {
    const text = writtenDraft.trim();
    if (!text) {
      toast.error("Write something before saving.");
      return;
    }
    if (writtenMode === "edit" && editingNoteId) {
      setLocalByClient((prev) => {
        const base = prev[client.id] ?? getServerProfileNotes(client);
        const next = base.map((n) =>
          n.id === editingNoteId && n.kind === "text" ? { ...n, text } : n,
        );
        return { ...prev, [client.id]: next };
      });
      toast.success("Note updated");
    } else {
      appendNote({
        id: newId(),
        kind: "text",
        createdAt: new Date().toISOString(),
        text,
      });
      toast.success("Note added");
    }
    setWrittenOpen(false);
    setEditingNoteId(null);
    setWrittenMode("add");
  };

  const formatElapsed = (total: number) => {
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  return (
    <div id="client-tab-notes-panel" role="tabpanel" aria-labelledby="client-tab-notes-trigger">
      <div className="mt-6 flex flex-wrap gap-2">
          <button type="button" className={toolbarBtnClass} onClick={openWrittenDialog}>
            <PenLine className="size-4 shrink-0 opacity-80" strokeWidth={2} aria-hidden />
            Type note
          </button>
          <button
            type="button"
            className={toolbarBtnClass}
            onClick={() => uploadInputRef.current?.click()}
          >
            <Upload className="size-4 shrink-0 opacity-80" strokeWidth={2} aria-hidden />
            Upload audio
          </button>
          <input
            ref={uploadInputRef}
            type="file"
            accept="audio/*"
            className="sr-only"
            aria-hidden
            tabIndex={-1}
            onChange={onUploadAudio}
          />
          {!recording ? (
            <button type="button" className={toolbarBtnClass} onClick={startMeetingRecording}>
              <Mic className="size-4 shrink-0 opacity-80" strokeWidth={2} aria-hidden />
              Record meeting
            </button>
          ) : (
            <div className="flex flex-wrap items-center gap-2 rounded-md border border-fora-border bg-fora-app px-3 py-2">
              <span
                className="inline-flex size-2.5 shrink-0 rounded-md bg-red-500"
                aria-hidden
              />
              <span className="text-[14px] font-medium tabular-nums text-fora-navy">
                Recording {formatElapsed(recordSeconds)}
              </span>
              <button
                type="button"
                onClick={stopMeetingRecording}
                className="inline-flex h-9 items-center gap-1.5 rounded-sm bg-fora-navy px-3 text-[13px] font-medium text-white hover:opacity-90"
              >
                <Square className="size-3.5 fill-current" strokeWidth={0} aria-hidden />
                Stop & save
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 space-y-4">
          {sortedCards.map((note) => (
            <article
              key={note.id}
              className="rounded-md border border-fora-border bg-white px-4 py-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[14px] font-semibold text-fora-navy">{noteKindHeading(note)}</p>
                  <p className="mt-0.5 text-[12px] text-fora-muted">{formatNoteTimestamp(note.createdAt)}</p>
                </div>
                <div className="flex shrink-0 items-center gap-0.5">
                  {note.kind === "text" ? (
                    <button
                      type="button"
                      className="shrink-0 rounded-md p-2 text-fora-muted transition-colors hover:bg-fora-app hover:text-fora-navy"
                      aria-label="Edit note"
                      onClick={() => openEditWrittenNote(note)}
                    >
                      <Pencil className="size-4" strokeWidth={2} aria-hidden />
                    </button>
                  ) : null}
                  <button
                    type="button"
                    className="shrink-0 rounded-md p-2 text-fora-muted transition-colors hover:bg-fora-app hover:text-fora-danger"
                    aria-label="Remove note"
                    onClick={() => removeNote(note.id)}
                  >
                    <Trash2 className="size-4" strokeWidth={2} aria-hidden />
                  </button>
                </div>
              </div>
              {note.text ? (
                <p className="mt-3 whitespace-pre-wrap text-[14px] leading-relaxed text-fora-navy">
                  {note.text}
                </p>
              ) : null}
              {note.audioObjectUrl ? (
                <audio
                  controls
                  className="mt-3 h-10 w-full max-w-full"
                  src={note.audioObjectUrl}
                  preload="metadata"
                />
              ) : null}
            </article>
          ))}
      </div>

      <Dialog.Root
        open={writtenOpen}
        onOpenChange={(next) => {
          setWrittenOpen(next);
          if (!next) {
            setEditingNoteId(null);
            setWrittenMode("add");
          }
        }}
      >
        <Dialog.Portal>
          <Dialog.Backdrop
            className={cn(
              "fixed inset-0 z-50 bg-black/25 transition-[opacity] duration-150 data-[ending-style]:opacity-0 data-[starting-style]:opacity-0",
            )}
          />
          <Dialog.Viewport className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <Dialog.Popup
              className={cn(
                "max-h-[min(90vh,640px)] w-full max-w-md overflow-y-auto rounded-md border border-fora-border bg-white p-6 shadow-lg outline-none transition-[opacity,transform] duration-150 data-[ending-style]:scale-[0.98] data-[ending-style]:opacity-0 data-[starting-style]:scale-[0.98] data-[starting-style]:opacity-0",
              )}
            >
              <Dialog.Title className="font-sans text-lg font-semibold tracking-tight text-fora-navy">
                {writtenMode === "edit" ? "Edit written note" : "Written note"}
              </Dialog.Title>
              {writtenMode === "add" ? (
                <Dialog.Description className="mt-1 text-sm text-fora-muted">
                  {
                    "Travel preferences, call summaries, or anything you want on this client's timeline."
                  }
                </Dialog.Description>
              ) : null}

              {writtenOpen ? (
                <div className="mt-6 space-y-4">
                  <Textarea
                    id={`${reactId}-written`}
                    aria-label="Note"
                    value={writtenDraft}
                    onChange={(e) => setWrittenDraft(e.target.value)}
                    className={TEXT_FIELD}
                    placeholder="e.g. Prefers aisle seats, confirmed late checkout for March trip…"
                  />
                  <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end sm:gap-3">
                    <Dialog.Close
                      type="button"
                      className={cn(
                        "inline-flex h-10 shrink-0 items-center justify-center rounded-md border border-fora-border bg-white px-4 text-[15px] font-medium text-fora-navy outline-none transition-colors hover:bg-fora-app focus-visible:ring-2 focus-visible:ring-fora-border/60",
                      )}
                    >
                      Cancel
                    </Dialog.Close>
                    <Button
                      type="button"
                      onClick={saveWrittenNote}
                      className="h-10 rounded-md bg-black px-6 text-[15px] font-medium text-white hover:bg-gray-800"
                    >
                      {writtenMode === "edit" ? "Save changes" : "Add to timeline"}
                    </Button>
                  </div>
                </div>
              ) : null}
            </Dialog.Popup>
          </Dialog.Viewport>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
