import { db } from "./firebase";
import { Timestamp } from "firebase-admin/firestore";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS  = 5;

export async function assertNotRateLimited(ip: string) {
  const ref = db.collection("ratelimits").doc(ip);

  await db.runTransaction(async tx => {
    const snap = await tx.get(ref);
    const now  = Date.now();

    let data = snap.exists
      ? snap.data() as { hits: number; resetAt: FirebaseFirestore.Timestamp }
      : { hits: 0, resetAt: Timestamp.fromMillis(now + WINDOW_MS) };

    // se la finestra è scaduta, ricomincia
    if (data.resetAt.toMillis() < now) {
      data = { hits: 0, resetAt: Timestamp.fromMillis(now + WINDOW_MS) };
    }

    data.hits += 1;
    if (data.hits > MAX_HITS) throw new Error("RATE_LIMIT");

    tx.set(ref, data, { merge: true });
  });
}