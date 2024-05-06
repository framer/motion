import { framer, CanvasNode } from "framer-plugin";
import { useState, useEffect } from "react";

export function useSelection() {
  const [selection, setSelection] = useState<CanvasNode[]>([]);

  useEffect(() => {
    return framer.subscribeToSelection(setSelection);
  }, []);

  return selection;
}
