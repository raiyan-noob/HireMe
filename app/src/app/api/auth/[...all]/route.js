import { auth, db } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { ObjectId } from "mongodb";

const handlers = toNextJsHandler(auth);

// Auto-repair orphaned OAuth accounts when user was deleted but account record remained
async function autoRepairOrphanedAccounts() {
  try {
    const accounts = await db.collection("account").find({}).toArray();
    for (const acc of accounts) {
      if (!acc.userId) continue;
      const userConditions = [{ id: acc.userId }];
      try {
        if (ObjectId.isValid(acc.userId)) {
          userConditions.push({ _id: new ObjectId(acc.userId) });
        }
      } catch {}
      try {
        userConditions.push({ _id: acc.userId });
      } catch {}

      const user = await db.collection("user").findOne({ $or: userConditions });
      if (!user) {
        console.warn(
          `[Better Auth Repair] Cleaning up orphaned account (${acc.providerId}: ${acc.accountId}) referencing non-existent user (${acc.userId})`
        );
        await db.collection("account").deleteOne({ _id: acc._id });
      }
    }
  } catch (err) {
    console.error("[Better Auth Repair] Error checking orphaned accounts:", err);
  }
}

export const GET = async (req) => {
  await autoRepairOrphanedAccounts();
  return handlers.GET(req);
};

export const POST = async (req) => {
  return handlers.POST(req);
};
