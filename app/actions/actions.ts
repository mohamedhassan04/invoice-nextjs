"use server";

import prisma from "@/lib/prisma";
import { randomBytes } from "crypto";

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

const generateUniqueId = async (): Promise<string> => {
  let uniqueId: string = "";
  let isUnique = false;
  while (!isUnique) {
    uniqueId = randomBytes(3).toString("hex");
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: uniqueId },
    });
    if (!existingInvoice) {
      isUnique = true;
    }
  }
  return uniqueId;
};

export async function createEmptyInvoice(email: string, name: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    const invoiceId = await generateUniqueId();
    if (user) {
      const newInvoice = await prisma.invoice.create({
        data: {
          id: invoiceId,
          name: name,
          userId: user?.id,
          issuerName: "",
          issuerAddress: "",
          clientName: "",
          clientAddress: "",
          invoiceDate: "",
          dueDate: "",
          vatActive: false,
          vatRate: 19,
        },
      });
      return newInvoice;
    }
  } catch (error) {
    console.log("Error creating empty invoice:", error);
  }
}

export async function getInvoicesByEmail(email: string) {
  if (!email) return;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        invoices: {
          include: {
            lines: true,
          },
        },
      },
    });

    // status possible : 1: Brouillon, 2: En attente, 3: Payée, 4: Annulée, 5: Impayée
    if (user) {
      const today = new Date();
      const updatedInvoices = await Promise.all(
        user.invoices.map(async (invoice) => {
          const dueDate = new Date(invoice.dueDate);
          if (dueDate < today && invoice.status == 2) {
            const updatedInvoice = await prisma.invoice.update({
              where: { id: invoice.id },
              data: { status: 5 },
              include: {
                lines: true,
              },
            });
            return updatedInvoice;
          }
          return invoice;
        })
      );
      return updatedInvoices;
    }
  } catch (error) {
    console.log("Error fetching invoices by email:", error);
  }
}
