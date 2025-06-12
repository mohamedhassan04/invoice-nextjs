import { Invoice } from "@/types/type";
import React from "react";

type InvoiceInfoProps = {
  invoice: Invoice;
  setInvoice: (invoice: Invoice) => void;
};

const InvoiceInfo: React.FC<InvoiceInfoProps> = ({ invoice, setInvoice }) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    const newInvoice = { ...invoice, [field]: e.target.value };
    setInvoice(newInvoice);
  };

  return (
    <div className="flex flex-col h-fit bg-base-200 p-5 rounded-xl mb-4 md:mb-0">
      <div className="space-y-4">
        <h2 className="badge badge-accent">Emetteur</h2>
        <input
          type="text"
          value={invoice?.issuerName}
          onChange={(e) => handleInputChange(e, "issuerName")}
          placeholder="Nom de l'émetteur..."
          className="input input-bordered w-full resize-none"
          required
        />
        <textarea
          value={invoice?.issuerAddress}
          onChange={(e) => handleInputChange(e, "issuerAddress")}
          placeholder="Adresse de l'émetteur..."
          className="textarea textarea-bordered w-full resize-none"
          aria-rowcount={5}
          required
        ></textarea>

        <h2 className="badge badge-accent">Client</h2>
        <input
          type="text"
          value={invoice?.clientName}
          onChange={(e) => handleInputChange(e, "clientName")}
          placeholder="Nom de client..."
          className="input input-bordered w-full resize-none"
          required
        />
        <textarea
          value={invoice?.clientAddress}
          onChange={(e) => handleInputChange(e, "clientAddress")}
          placeholder="Adresse de client..."
          className="textarea textarea-bordered w-full resize-none"
          aria-rowcount={5}
          required
        ></textarea>

        <h2 className="badge badge-accent">Date de la facture</h2>
        <input
          type="date"
          value={invoice?.invoiceDate}
          onChange={(e) => handleInputChange(e, "invoiceDate")}
          placeholder="Date de la facture..."
          className="input input-bordered w-full resize-none"
          required
        />

        <h2 className="badge badge-accent">Date de l'échéance</h2>
        <input
          type="date"
          value={invoice?.dueDate}
          onChange={(e) => handleInputChange(e, "dueDate")}
          placeholder="Date d'échéance de la facture..."
          className="input input-bordered w-full resize-none"
          required
        />
      </div>
    </div>
  );
};

export default InvoiceInfo;
