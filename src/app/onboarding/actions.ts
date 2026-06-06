"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { COUNTRIES } from "@/lib/countries";

export async function saveFavoriteAction(formData: FormData): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const code = String(formData.get("favoriteCode") ?? "");
  const valid = COUNTRIES.some((c) => c.code === code);

  await prisma.user.update({
    where: { id: user.id },
    data: { favoriteCode: valid ? code : null, onboarded: true },
  });

  redirect("/matchs");
}
