"use client";

import { useSyncExternalStore } from "react";
import { canPersistProgress, subscribeStorageAvailability } from "@/utils/browserStorage";

export function TemporaryProgressNotice() {
  const persistent = useSyncExternalStore(subscribeStorageAvailability, canPersistProgress, () => true);
  if (persistent) return null;
  return (
    <p className="atlas-temporary-notice" role="status">
      Temporary progress. You can keep playing, but this browser isn’t saving your progress.
    </p>
  );
}
