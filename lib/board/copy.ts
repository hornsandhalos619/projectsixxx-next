export const boardCopy = {
  signIn: "A house key is required to speak.",
  noLedger: "This host has no hall ledger yet.",
  unknownKey: "This key is not in the house ledger.",
  unseated: "The hall ledger is not seated yet.",
  keepFailed: "The hall could not keep that. Try again.",
  slowDown: "The hall asks for a slower hand. Wait a few minutes, then speak again.",
  markup: "Plain text only. The hall does not accept markup.",
  titleLength: "A title needs between 3 and 120 characters.",
  threadBodyLength: "The body needs between 1 and 4000 characters.",
  replyBodyLength: "A reply needs between 1 and 2000 characters.",
  category: "Choose a hall.",
  sealed: "This thread is locked.",
  missingThread: "That thread is not on the floor.",
  founderOnly: "Only the Founder moves the hall.",
  intent: "That gesture is not recognized.",
} as const;

export const TITLE_MIN = 3;
export const TITLE_MAX = 120;
export const THREAD_BODY_MAX = 4000;
export const REPLY_BODY_MAX = 2000;
export const RATE_LIMIT = 5;
export const RATE_WINDOW_MS = 10 * 60 * 1000;
