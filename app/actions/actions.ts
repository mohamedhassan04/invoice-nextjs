"use server";

import prisma from "@/lib/prisma";

export async function checkAndAddUser(email: string, name: string) {
  if (!email) return;
  try {
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser && name) {
      // If the user does not exist, create a new user
      await prisma.user.create({
        data: {
          email,
          name,
        },
      });
    }
  } catch (error) {
    console.log("Error checking or adding user:", error);
  }
}
