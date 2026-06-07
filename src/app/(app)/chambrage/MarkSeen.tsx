"use client";

import { useEffect } from "react";
import { markPostsSeenAction } from "./actions";

// Marque le mur comme lu dès l'ouverture (efface la pastille au prochain affichage)
export default function MarkSeen() {
  useEffect(() => {
    markPostsSeenAction();
  }, []);
  return null;
}
