"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword } from "@/lib/auth";

export type ResetState = {
  password?: string;
  forName?: string;
  error?: string;
};

// Génère un mot de passe temporaire lisible (sans caractères ambigus)
function genTempPassword(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const bytes = crypto.randomBytes(8);
  let s = "";
  for (let i = 0; i < 8; i++) s += alphabet[bytes[i] % alphabet.length];
  return s;
}

// Admin : réinitialise le mot de passe d'un joueur et renvoie le mot de passe
// temporaire à lui transmettre.
export async function resetPasswordAction(
  _prev: ResetState,
  formData: FormData,
): Promise<ResetState> {
  const admin = await getCurrentUser();
  if (!admin?.isAdmin) return { error: "Accès refusé." };

  const userId = String(formData.get("userId") ?? "");
  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { error: "Utilisateur introuvable." };

  const temp = genTempPassword();
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(temp) },
  });

  revalidatePath("/admin");
  return { password: temp, forName: target.displayName };
}
