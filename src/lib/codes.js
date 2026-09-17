// Human-friendly codes. No 0/O/1/I so people can read them off a screen.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

const randomPart = (length) =>
  Array.from(
    { length },
    () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  ).join("");

export const makeTicketCode = () => `EVT-${randomPart(4)}-${randomPart(4)}`;

export const makeInviteCode = () => randomPart(8);
