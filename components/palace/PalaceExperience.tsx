"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useTransition,
} from "react";
import dynamic from "next/dynamic";
import {
  deathChoices,
  npcById,
  palace,
  palaceRooms,
  productRelics,
  storyBeats,
  type Alignment,
  type NpcId,
  type PalaceRoomId,
} from "@/config/palace";
import {
  defaultSave,
  dominantAlignment,
  PALACE_SAVE_KEY,
  type NpcChatMessage,
  type NpcChatResponse,
  type PalaceSave,
} from "@/lib/palace/types";

const PalaceCanvas = dynamic(
  () =>
    import("@/components/palace/PalaceCanvas").then((mod) => mod.PalaceCanvas),
  {
    ssr: false,
    loading: () => (
      <div className="palace-loading palace-loading--canvas" aria-live="polite">
        Forging the Palace…
      </div>
    ),
  },
);

function loadSave(): PalaceSave {
  if (typeof window === "undefined") return defaultSave();
  try {
    const raw = window.localStorage.getItem(PALACE_SAVE_KEY);
    if (!raw) return defaultSave();
    const parsed = JSON.parse(raw) as PalaceSave;
    if (parsed?.version !== 1) return defaultSave();
    return { ...defaultSave(), ...parsed };
  } catch {
    return defaultSave();
  }
}

function roomAt(x: number, z: number): PalaceRoomId | null {
  for (const room of palaceRooms) {
    const [cx, , cz] = room.center;
    const [sx, , sz] = room.size;
    if (
      x >= cx - sx / 2 &&
      x <= cx + sx / 2 &&
      z >= cz - sz / 2 &&
      z <= cz + sz / 2
    ) {
      return room.id;
    }
  }
  return null;
}

export function PalaceExperience() {
  const [started, setStarted] = useState(false);
  const [save, setSave] = useState<PalaceSave>(defaultSave);
  const [room, setRoom] = useState<PalaceRoomId>("vestibule");
  const [focusNpc, setFocusNpc] = useState<NpcId | null>(null);
  const [focusProduct, setFocusProduct] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [activeNpc, setActiveNpc] = useState<NpcId | null>(null);
  const [history, setHistory] = useState<NpcChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [reply, setReply] = useState("");
  const [replySource, setReplySource] = useState<"llm" | "script" | null>(null);
  const [suggested, setSuggested] = useState<string[]>([]);
  const [deathOpen, setDeathOpen] = useState(false);
  const [beat, setBeat] = useState(storyBeats[0]);
  const [puzzleProgress, setPuzzleProgress] = useState<Record<string, string[]>>({});
  const [toast, setToast] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const saveRef = useRef(save);

  useEffect(() => {
    const loaded = loadSave();
    setSave(loaded);
    saveRef.current = loaded;
    const progress: Record<string, string[]> = {};
    for (const id of loaded.puzzlesSolved) {
      const roomPuzzle = palaceRooms.find((entry) => entry.puzzle?.id === id)?.puzzle;
      if (roomPuzzle) progress[id] = [...roomPuzzle.sequence];
    }
    setPuzzleProgress(progress);
  }, []);

  const persist = useCallback((next: PalaceSave) => {
    saveRef.current = next;
    setSave(next);
    window.localStorage.setItem(PALACE_SAVE_KEY, JSON.stringify(next));
  }, []);

  const uiBlocked = !started || chatOpen || deathOpen;

  const alignment = useMemo(() => dominantAlignment(save), [save]);

  const onPosition = useCallback(
    (x: number, z: number) => {
      const here = roomAt(x, z);
      if (here && here !== room) {
        setRoom(here);
        if (!saveRef.current.roomsVisited.includes(here)) {
          persist({
            ...saveRef.current,
            roomsVisited: [...saveRef.current.roomsVisited, here],
          });
        }
        if (here === "duality" && saveRef.current.gateChosen === "unaligned") {
          setBeat(storyBeats.find((entry) => entry.id === "first-gate") ?? storyBeats[0]);
          document.exitPointerLock?.();
        }
        if (here === "liminal") {
          setBeat(storyBeats.find((entry) => entry.id === "death-threshold") ?? storyBeats[0]);
          setDeathOpen(true);
          document.exitPointerLock?.();
        }
      }
    },
    [persist, room],
  );

  const chooseGate = useCallback(
    (side: Alignment) => {
      if (side !== "horns" && side !== "halos") return;
      const next: PalaceSave = {
        ...saveRef.current,
        gateChosen: side,
        horns: saveRef.current.horns + (side === "horns" ? 2 : 0),
        halos: saveRef.current.halos + (side === "halos" ? 2 : 0),
        flags: [...new Set([...saveRef.current.flags, `gate:${side}`])],
      };
      persist(next);
      setToast(
        side === "horns"
          ? "You take the Horns gate. Conflict marks your first step."
          : "You take the Halos gate. Balance marks your first step.",
      );
    },
    [persist],
  );

  const onPadStep = useCallback(
    (puzzleId: string, padId: string) => {
      setPuzzleProgress((prev) => {
        const current = prev[puzzleId] ?? [];
        if (current.includes(padId)) return prev;
        const roomPuzzle = palaceRooms.find((entry) => entry.puzzle?.id === puzzleId)?.puzzle;
        if (!roomPuzzle) return prev;
        const expected = roomPuzzle.sequence[current.length];
        if (padId !== expected) {
          setToast("The seals reject the wrong order. Begin again.");
          return { ...prev, [puzzleId]: [] };
        }
        const nextSeq = [...current, padId];
        if (nextSeq.length === roomPuzzle.sequence.length) {
          const hornsBoost = puzzleId.includes("conflict") ? 3 : 0;
          const halosBoost = puzzleId.includes("balance") ? 3 : 0;
          persist({
            ...saveRef.current,
            horns: saveRef.current.horns + hornsBoost,
            halos: saveRef.current.halos + halosBoost,
            puzzlesSolved: [...new Set([...saveRef.current.puzzlesSolved, puzzleId])],
          });
          setToast("The maze yields. A corridor of light opens in the mind.");
        }
        return { ...prev, [puzzleId]: nextSeq };
      });
    },
    [persist],
  );

  const openChat = useCallback((npcId: NpcId) => {
    setActiveNpc(npcId);
    setChatOpen(true);
    setHistory([]);
    setReply(npcById(npcId).greeting);
    setReplySource("script");
    setSuggested(npcById(npcId).topics.slice(0, 3));
    document.exitPointerLock?.();
    if (!saveRef.current.spokenWith.includes(npcId)) {
      persist({
        ...saveRef.current,
        spokenWith: [...saveRef.current.spokenWith, npcId],
      });
    }
  }, [persist]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (!started) return;
      if (event.code === "KeyE" && focusNpc && !chatOpen && !deathOpen) {
        openChat(focusNpc);
      }
      if (event.code === "KeyF" && focusProduct && !chatOpen) {
        const relic = productRelics.find((entry) => entry.id === focusProduct);
        if (relic) window.open(relic.href, "_blank", "noopener,noreferrer");
      }
      if (event.code === "KeyG" && room === "duality" && save.gateChosen === "unaligned") {
        // no-op hint handled in HUD
      }
      if (event.code === "KeyX" && room === "liminal") {
        setDeathOpen(true);
        document.exitPointerLock?.();
      }
      if (event.code === "Escape") {
        setChatOpen(false);
        setDeathOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [started, focusNpc, focusProduct, chatOpen, deathOpen, openChat, room, save.gateChosen]);

  async function sendMessage(text: string) {
    if (!activeNpc || !text.trim()) return;
    const message = text.trim();
    setDraft("");
    const nextHistory: NpcChatMessage[] = [
      ...history,
      { role: "user", content: message },
    ];
    setHistory(nextHistory);
    startTransition(async () => {
      try {
        const response = await fetch("/api/palace/npc", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            npcId: activeNpc,
            message,
            history: nextHistory,
            save: saveRef.current,
          }),
        });
        const data = (await response.json()) as NpcChatResponse & { error?: string };
        if (!response.ok) throw new Error(data.error || "NPC wire failed");
        setReply(data.reply);
        setReplySource(data.source);
        setSuggested(data.suggested ?? []);
        setHistory([
          ...nextHistory,
          { role: "assistant", content: data.reply },
        ]);
      } catch {
        setReply("The wire flickers. The sealed script holds — try again in a moment.");
        setReplySource("script");
      }
    });
  }

  function resolveDeath(choiceId: string) {
    const choice = deathChoices.find((entry) => entry.id === choiceId);
    if (!choice) return;
    const next: PalaceSave = {
      ...saveRef.current,
      deaths: saveRef.current.deaths + 1,
      lastDeathChoice: choice.id,
      horns: saveRef.current.horns + (choice.effect === "horns" ? 4 : choice.effect === "balance" ? 2 : 0),
      halos: saveRef.current.halos + (choice.effect === "halos" ? 4 : choice.effect === "balance" ? 2 : 0),
      flags: [...new Set([...saveRef.current.flags, `death:${choice.id}`])],
    };
    persist(next);
    setBeat(storyBeats.find((entry) => entry.id === "stewardship") ?? storyBeats[0]);
    setToast(choice.epitaph);
    setDeathOpen(false);
  }

  const roomMeta = palaceRooms.find((entry) => entry.id === room);

  return (
    <div className={`palace-root${started ? " is-started" : ""}`}>
      <div className={`palace-stage${!uiBlocked ? " is-live" : ""}`}>
        <PalaceCanvas
          controlsEnabled={started && !chatOpen && !deathOpen}
          uiBlocked={uiBlocked}
          puzzleProgress={puzzleProgress}
          onPosition={onPosition}
          onNpcFocus={setFocusNpc}
          onPadStep={onPadStep}
          onProductFocus={setFocusProduct}
        />
      </div>

      {!started && (
        <div className="palace-gate">
          <div className="palace-gate__veil" aria-hidden />
          <div className="palace-gate__copy">
            <p className="palace-kicker">{palace.kicker}</p>
            <h1 className="palace-title">{palace.title}</h1>
            <p className="palace-axiom">{palace.axiom}</p>
            <p className="palace-blurb">{palace.blurb}</p>
            <p className="palace-beat">{beat.body}</p>
            <div className="palace-gate__actions">
              <button
                type="button"
                className="palace-btn palace-btn--ember"
                onClick={() => setStarted(true)}
              >
                Enter the Palace
              </button>
              <Link className="palace-btn palace-btn--ghost" href="/shop">
                Return to Shop
              </Link>
              <Link className="palace-btn palace-btn--ghost" href="/horns-and-halos">
                Twin Gates
              </Link>
            </div>
            <p className="palace-hint">
              WASD move · mouse look · E speak · F open relic shop · Esc release
            </p>
            <p className="palace-shell-note">
              Blender shell: drop your exported palace at{" "}
              <code>{palace.shellGlbPath}</code> — procedural halls run until then.
            </p>
          </div>
        </div>
      )}

      {started && (
        <div className="palace-hud" aria-live="polite">
          <div className="palace-hud__brand">
            <span>Project SiXXX</span>
            <strong>{palace.title}</strong>
          </div>
          <div className="palace-hud__room">
            <span className="palace-kicker">{roomMeta?.name}</span>
            <p>{roomMeta?.dek}</p>
          </div>
          <div className="palace-hud__ledger">
            <span data-side="horns">Horns {save.horns}</span>
            <span data-side="halos">Halos {save.halos}</span>
            <span>Deaths {save.deaths}</span>
            <span>Lean {alignment}</span>
          </div>
          {focusNpc && !chatOpen && (
            <p className="palace-prompt">
              Press <kbd>E</kbd> to speak with {npcById(focusNpc).name}
            </p>
          )}
          {focusProduct && (
            <p className="palace-prompt">
              Press <kbd>F</kbd> to open{" "}
              {productRelics.find((entry) => entry.id === focusProduct)?.name} in the shop
            </p>
          )}
          {room === "duality" && save.gateChosen === "unaligned" && (
            <div className="palace-gate-choice">
              <p>Choose your first gate — the agents will remember.</p>
              <button type="button" onClick={() => chooseGate("horns")}>
                Horns — Infinite Conflict
              </button>
              <button type="button" onClick={() => chooseGate("halos")}>
                Halos — Eternal Balance
              </button>
            </div>
          )}
          <button type="button" id="palace-lock" className="palace-btn palace-btn--ghost palace-relock">
            Click canvas to look
          </button>
          <Link className="palace-exit" href="/">
            Leave House
          </Link>
        </div>
      )}

      {toast && (
        <div className="palace-toast" role="status">
          <p>{toast}</p>
          <button type="button" onClick={() => setToast(null)}>
            Seal
          </button>
        </div>
      )}

      {chatOpen && activeNpc && (
        <div className="palace-chat" role="dialog" aria-label="NPC dialogue">
          <header>
            <p className="palace-kicker">{npcById(activeNpc).title}</p>
            <h2>{npcById(activeNpc).name}</h2>
            <p className="palace-chat__role">{npcById(activeNpc).role}</p>
            {replySource && (
              <p className="palace-chat__source">
                Wire: {replySource === "llm" ? "OVERMIND live" : "sealed script"}
              </p>
            )}
          </header>
          <div className="palace-chat__body">
            <p>{reply}</p>
          </div>
          <div className="palace-chat__suggest">
            {suggested.map((topic) => (
              <button key={topic} type="button" onClick={() => void sendMessage(topic)}>
                {topic}
              </button>
            ))}
          </div>
          <form
            className="palace-chat__form"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage(draft);
            }}
          >
            <input
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder={`Ask ${npcById(activeNpc).name}…`}
              disabled={pending}
            />
            <button type="submit" disabled={pending || !draft.trim()}>
              Speak
            </button>
          </form>
          <button
            type="button"
            className="palace-btn palace-btn--ghost"
            onClick={() => setChatOpen(false)}
          >
            Close
          </button>
        </div>
      )}

      {deathOpen && (
        <div className="palace-death" role="dialog" aria-label="Threshold of Death">
          <p className="palace-kicker">Threshold of Death</p>
          <h2>Right and wrong, under pressure</h2>
          <p>
            The land outside is torn by infinite conflict. Here, analysis and action decide what
            returns. Your storyline builds on this choice.
          </p>
          <div className="palace-death__choices">
            {deathChoices.map((choice) => (
              <button key={choice.id} type="button" onClick={() => resolveDeath(choice.id)}>
                <strong>{choice.label}</strong>
                <span>{choice.epitaph}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
