import { Invoice } from "@/types/type";
import React from "react";

type VatControlProps = {
  invoice: Invoice;
  setInvoice: (invoice: Invoice) => void;
};

const VatControl: React.FC<VatControlProps> = ({ invoice, setInvoice }) => {
  return (
    <div className="flex items-center">
      <label className="block text-sm font-bold">TVA (%)</label>
      <input
        type="checkbox"
        className="toggle toggle-sm ml-2"
        checked={invoice.vatActive}
        onChange={(e) => {
          const newInvoice = { ...invoice, vatActive: e.target.checked };
          setInvoice(newInvoice);
        }}
      />
      {invoice.vatActive && (
        <input
          type="number"
          className="input input-sm input-bordered w-16 ml-2"
          value={invoice.vatRate}
          onChange={(e) => {
            const newInvoice = {
              ...invoice,
              vatRate: parseFloat(e.target.value),
            };
            setInvoice(newInvoice);
          }}
          min={0}
        />
      )}
    </div>
  );
};

export default VatControl;
