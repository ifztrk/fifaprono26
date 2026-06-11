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

  // Réponse éventuelle à un message existant (citation)
  const replyToId = String(formData.get("replyToId") ?? "") || null;
  const parent = replyToId
    ? await prisma.post.findUnique({
        where: { id: replyToId },
        select: { id: true, userId: true },
      })
    : null;

  const post = await prisma.post.create({
    data: { userId: user.id, content, replyToId: parent?.id ?? null },
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
  // @tous : ping tout le monde
  const pingAll = /@tous\b/i.test(content);

  if (mentioned.length > 0) {
    await prisma.mention.createMany({
      data: mentioned.map((u) => ({ postId: post.id, userId: u.id })),
    });
  }

  // Destinataires des notifications push (userId → corps du message).
  // Priorité : @mention > @tous, et la réponse ne double pas une mention.
  const targets = new Map<string, string>();
  if (pingAll) {
    for (const u of others)
      targets.set(u.id, `${user.displayName} a pingé tout le monde 📣`);
  }
  for (const u of mentioned) {
    targets.set(u.id, `${user.displayName} t'a mentionné dans Disfootons`);
  }
  if (parent && parent.userId !== user.id && !targets.has(parent.userId)) {
    targets.set(
      parent.userId,
      `${user.displayName} t'a répondu dans Disfootons`,
    );
  }

  await Promise.all(
    [...targets].map(([id, body]) =>
      sendToUser(id, { title: "FIFAPRONO 26 💬", body, url: "/chambrage" }),
    ),
  );

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
