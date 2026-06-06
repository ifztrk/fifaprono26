"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";

export type PwState = { ok?: boolean; error?: string };

export async function changePasswordAction(
  _prev: PwState,
  formData: FormData,
): Promise<PwState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Session expirée, reconnecte-toi." };

  const current = String(formData.get("current") ?? "");
  const next = String(formData.get("next") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (!(await verifyPassword(current, user.passwordHash)))
    return { error: "Mot de passe actuel incorrect." };
  if (next.length < 6)
    return { error: "Le nouveau mot de passe doit faire au moins 6 caractères." };
  if (next !== confirm) return { error: "Les deux mots de passe ne correspondent pas." };

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(next) },
  });

  return { ok: true };
}
