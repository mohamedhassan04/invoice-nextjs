"use server";

import prisma from "@/lib/prisma";
import { Invoice } from "@/types/type";
import { InvoiceLine } from "@prisma/client";
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

export async function getInvoiceById(invoiceId: string) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        lines: true,
      },
    });
    if (!invoice) {
      throw new Error("facture non trouvée");
    }
    return invoice;
  } catch (error) {
    console.log("Error fetching invoice by id:", error);
  }
}

export async function updateInvoice(invoice: Invoice) {
  try {
    const existingInvoice = await prisma.invoice.findUnique({
      where: { id: invoice.id },
      include: {
        lines: true,
      },
    });

    if (!existingInvoice) {
      throw new Error(`facture avec ce numéro ${invoice.id} introuvable`);
    }

    await prisma.invoice.update({
      where: { id: invoice.id },
      data: {
        issuerName: invoice.issuerName,
        issuerAddress: invoice.issuerAddress,
        clientName: invoice.clientName,
        clientAddress: invoice.clientAddress,
        invoiceDate: invoice.invoiceDate,
        dueDate: invoice.dueDate,
        vatActive: invoice.vatActive,
        vatRate: invoice.vatRate,
        status: invoice.status,
      },
    });

    const existingLines = existingInvoice?.lines;
    const receivedLines = invoice.lines;

    // Delete lines that are not in the received invoice
    const linesToDelete = existingLines.filter(
      (existingLine: any) =>
        !receivedLines.some((line: InvoiceLine) => line.id === existingLine.id)
    );

    // Delete the lines
    if (linesToDelete.length > 0) {
      await prisma.invoiceLine.deleteMany({
        where: {
          id: {
            in: linesToDelete.map((line: any) => line.id),
          },
        },
      });
    }

    // Update existing lines that are in the received invoice
    for (const line of receivedLines) {
      const existingLine = existingLines.find((l: any) => l.id === line.id);
      if (existingLine) {
        const hasChanged =
          line.quantity !== existingLine.quantity ||
          line.unitPrice !== existingLine.unitPrice ||
          line.description !== existingLine.description;
        if (hasChanged) {
          await prisma.invoiceLine.update({
            where: { id: line.id },
            data: {
              quantity: line.quantity,
              unitPrice: line.unitPrice,
              description: line.description,
            },
          });
        }
      } else {
        // create a new line
        await prisma.invoiceLine.create({
          data: {
            quantity: line.quantity,
            unitPrice: line.unitPrice,
            description: line.description,
            invoiceId: invoice.id,
          },
        });
      }
    }
  } catch (error) {
    console.error("Error updating invoice status:", error);
  }
}

export async function deleteInvoice(invoiceId: string) {
  try {
    const deletedInvoice = await prisma.invoice.delete({
      where: { id: invoiceId },
    });
    if (!deletedInvoice) {
      throw new Error(`facture avec ce numéro ${invoiceId} introuvable`);
    }
    return deletedInvoice;
  } catch (error) {
    console.error("Error deleting invoice:", error);
  }
}
