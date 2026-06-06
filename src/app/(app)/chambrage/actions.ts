"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export type PostState = { ok?: boolean; error?: string };

export async function postMessageAction(
  _prev: PostState,
  formData: FormData,
): Promise<PostState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Reconnecte-toi." };

  const content = String(formData.get("content") ?? "").trim();
  if (!content) return { error: "Écris un message." };
  if (content.length > 280)
    return { error: "280 caractères maximum." };

  await prisma.post.create({ data: { userId: user.id, content } });
  revalidatePath("/chambrage");
  return { ok: true };
}

export async function deletePostAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const id = String(formData.get("id") ?? "");
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return;
  // L'auteur ou un admin peut supprimer
  if (post.userId !== user.id && !user.isAdmin) return;
  await prisma.post.delete({ where: { id } });
  revalidatePath("/chambrage");
}
