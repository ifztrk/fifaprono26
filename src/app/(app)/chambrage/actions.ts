"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { sendToUser } from "@/lib/push";
import { REACTION_EMOJIS } from "./constants";

export type PostState = { ok?: boolean; error?: string };

export async function postMessageAction(
  _prev: PostState,
  formData: FormData,
): Promise<PostState> {
  const user = await getCurrentUser();
  if (!user) return { error: "Reconnecte-toi." };

  const content = String(formData.get("content") ?? "").trim();
  if (!content) return { error: "Écris un message." };
  if (content.length > 280) return { error: "280 caractères maximum." };

  const post = await prisma.post.create({
    data: { userId: user.id, content },
  });

  // Détection des @mentions (par pseudo, insensible à la casse)
  const others = await prisma.user.findMany({
    where: { id: { not: user.id } },
    select: { id: true, displayName: true },
  });
  const lower = content.toLowerCase();
  const mentioned = others.filter((u) =>
    lower.includes("@" + u.displayName.toLowerCase()),
  );

  if (mentioned.length > 0) {
    await prisma.mention.createMany({
      data: mentioned.map((u) => ({ postId: post.id, userId: u.id })),
    });
    // Notification push aux mentionnés
    await Promise.all(
      mentioned.map((u) =>
        sendToUser(u.id, {
          title: "FIFAPRONO 26 💬",
          body: `${user.displayName} t'a mentionné dans Disfootons`,
          url: "/chambrage",
        }),
      ),
    );
  }

  revalidatePath("/chambrage");
  return { ok: true };
}

export async function deletePostAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const id = String(formData.get("id") ?? "");
  const post = await prisma.post.findUnique({ where: { id } });
  if (!post) return;
  if (post.userId !== user.id && !user.isAdmin) return;
  await prisma.post.delete({ where: { id } });
  revalidatePath("/chambrage");
}

// Marque le mur comme lu (appelé à l'ouverture de la page)
export async function markPostsSeenAction(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  await prisma.user.update({
    where: { id: user.id },
    data: { lastSeenPosts: new Date() },
  });
}

// Ajoute / retire une réaction emoji
export async function toggleReactionAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;
  const postId = String(formData.get("postId") ?? "");
  const emoji = String(formData.get("emoji") ?? "");
  if (!postId || !(REACTION_EMOJIS as readonly string[]).includes(emoji))
    return;

  const existing = await prisma.reaction.findUnique({
    where: { postId_userId_emoji: { postId, userId: user.id, emoji } },
  });
  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.reaction.create({
      data: { postId, userId: user.id, emoji },
    });
  }
  revalidatePath("/chambrage");
}
