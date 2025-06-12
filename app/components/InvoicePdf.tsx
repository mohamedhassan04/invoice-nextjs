import { Invoice, Totals } from "@/types/type";
import confetti from "canvas-confetti";
import html2canvas from "html2canvas-pro";
import jsPDF from "jspdf";
import n2words from "n2words";
import { ArrowDownFromLine, Layers } from "lucide-react";
import React, { useRef } from "react";

interface InvoicePdfProps {
  invoice: Invoice;
  totals: Totals;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const options: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "short",
    year: "numeric",
  };
  return date.toLocaleDateString("fr-FR", options);
}

const InvoicePdf: React.FC<InvoicePdfProps> = ({ invoice, totals }) => {
  const factureRef = useRef<HTMLDivElement>(null);
  const handleDownloadPDF = async () => {
    const element = factureRef.current;
    if (element) {
      try {
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "A4",
        });
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`Facture-${invoice.clientName}-${invoice.invoiceDate}.pdf`);
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          zIndex: 9999,
        });
      } catch (error) {
        console.log("Error downloading PDF:", error);
      }
    }
  };

  const convertAmountToWords = (amount: number): string => {
    const dinars = Math.floor(amount);
    const millimes = Math.round((amount - dinars) * 1000);

    const dinarsInWords = n2words(dinars, { lang: "fr" });
    const millimesInWords = millimes > 0 ? `${millimes} millimes` : "";

    return `${dinarsInWords} dinars${
      millimesInWords ? " et " + millimesInWords : ""
    }`;
  };
  return (
    <div className="mt-4 hidden lg:block">
      <div className="border-base-300 border border-dashed rounded-xl p-5">
        <button className="btn btn-accent mb-4" onClick={handleDownloadPDF}>
          Facture PDF <ArrowDownFromLine className="w-4" />
        </button>
        <div className="p-8 " ref={factureRef}>
          <div className="flex justify-between items-center text-sm">
            <div className="flex flex-col">
              <div>
                <div className="flex items-center">
                  <div className="bg-accent-content text-accent rounded-full p-2">
                    <Layers />
                  </div>
                  <span className="text-2xl font-bold italic">
                    In<span className="text-accent">Voice</span>
                  </span>
                </div>
              </div>
              <h1 className="text-7xl font-bold uppercase">Facture</h1>
            </div>
            <div className="text-right uppercase">
              <p className="badge badge-ghost font-semibold">
                Facture N° {invoice.id}
              </p>
              <p className="my-2">
                <strong>Date: </strong>
                {formatDate(invoice.invoiceDate)}
              </p>
              <p>
                <strong>Date d'échéance: </strong>
                {formatDate(invoice.dueDate)}
              </p>
            </div>
          </div>
          <div className="my-6 flex justify-between">
            <div>
              <p className="badge badge-ghost mb-2">Emetteur</p>
              <p className="text-sm font-bold italic">{invoice.issuerName}</p>
              <p className="text-sm text-gray-500 w-64 break-words">
                {invoice.issuerAddress}
              </p>
            </div>

            <div className="text-right">
              <p className="badge badge-ghost mb-2">Client</p>
              <p className="text-sm font-bold italic">{invoice.clientName}</p>
              <p className="text-sm text-gray-500 w-64 break-words">
                {invoice.clientAddress}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantité</th>
                  <th>Prix Unitaire</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lines.map((line, index) => (
                  <tr key={index}>
                    <td>{line.description}</td>
                    <td>{line.quantity}</td>
                    <td>{line.unitPrice.toFixed(2)}</td>
                    <td>{(line.unitPrice * line.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 space-y-2 text-md">
            <div className="flex justify-end">
              <div className="font-bold">Total HT:</div>
              <div className="ml-2 font-medium">
                {totals.totalHT.toFixed(2)} DT
              </div>
            </div>
            {invoice.vatActive && (
              <div className="flex justify-end">
                <div className="font-bold">TVA: {invoice.vatRate}%:</div>
                <div className="ml-2 font-medium">
                  {totals.totalVAT.toFixed(2)} DT
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <div className="font-bold">
                {invoice.vatActive ? "Total TTC:" : "Total:"}
              </div>
              <div className="ml-2 font-medium badge badge-warning">
                {totals.totalTTC.toFixed(2)} DT
              </div>
            </div>
          </div>

          <div className="mt-32 text-center">
            <div className="mt-32 text-center">
              <span className="text-sm italic text-gray-500">
                Cette facture est arrêtée à la somme de
                <strong className="ml-0.5">
                  {convertAmountToWords(
                    invoice.vatActive ? totals.totalTTC : totals.totalHT
                  )}
                </strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoicePdf;
