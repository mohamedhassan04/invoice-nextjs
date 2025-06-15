"use client";
import {
  deleteInvoice,
  getInvoiceById,
  updateInvoice,
} from "@/app/actions/actions";
import Calculators from "@/app/components/Calculators";
import InvoiceInfo from "@/app/components/InvoiceInfo";
import InvoiceLines from "@/app/components/InvoiceLines";
import InvoicePdf from "@/app/components/InvoicePdf";
import LoaderComponent from "@/app/components/LoaderComponent";
import VatControl from "@/app/components/VatControl";
import Wrapper from "@/app/components/Wrapper";
import { Invoice, Totals } from "@/types/type";
import { Calculator, Save, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

const Page = ({ params }: { params: Promise<{ invoiceId: string }> }) => {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [initialInvoice, setInitialInvoice] = useState<Invoice | null>(null);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [isSavedDisabled, setIsSavedDisabled] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [fetchDataLoading, setFetchDataLoading] = useState<boolean>(false);
  const router = useRouter();

  const fetchInvoiceById = async () => {
    try {
      const { invoiceId } = await params;
      setFetchDataLoading(true);
      const fetchedInvoice = await getInvoiceById(invoiceId);
      setInvoice(fetchedInvoice || null);
      setInitialInvoice(fetchedInvoice || null);
      setFetchDataLoading(false);
    } catch (error) {
      console.log("Error fetching invoice by ID:", error);
    }
  };

  useEffect(() => {
    fetchInvoiceById();
  }, []);

  useEffect(() => {
    if (!invoice) return;
    const ht = invoice.lines.reduce(
      (acc, line) => acc + line.quantity * line.unitPrice,
      0
    );
    const vat = invoice.vatActive ? ht * (invoice.vatRate / 100) : 0;
    setTotals({ totalHT: ht, totalVAT: vat, totalTTC: ht + vat });
  }, [invoice]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = parseInt(e.target.value);
    if (invoice) {
      const updatedInvoice = { ...invoice, status: newStatus };
      setInvoice(updatedInvoice);
    }
  };

  useEffect(() => {
    setIsSavedDisabled(
      JSON.stringify(invoice) === JSON.stringify(initialInvoice)
    );
  }, [invoice, initialInvoice]);

  const handleSave = async () => {
    if (!invoice) return;
    setIsLoading(true);
    try {
      await updateInvoice(invoice);
      const updatedInvoice = await getInvoiceById(invoice.id);
      setInvoice(updatedInvoice || null);
      setInitialInvoice(updatedInvoice || null);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log("Error saving invoice:", error);
    }
  };

  const handleDelete = async () => {
    const confirmed = window.confirm(
      "Etes-vous sur de vouloir supprimer cette facture?"
    );

    if (confirmed) {
      try {
        await deleteInvoice(invoice?.id || "");
        fetchInvoiceById();
        router.push("/");
      } catch (error) {
        console.log("Error deleting invoice:", error);
      }
    }
  };

  if (fetchDataLoading) return <LoaderComponent />;

  if (!invoice || !totals)
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <span className="font-bold">Facture Non Trouvée</span>
      </div>
    );

  return (
    <Wrapper>
      <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4">
        <p className="badge badge-ghost badge-lg uppercase">
          <span>Facture-{invoice?.id}</span>
        </p>
        <div className="flex md:mt-0 mt-4">
          <select
            className="select select-sm select-bordered w-full"
            value={invoice?.status}
            onChange={handleStatusChange}
          >
            <option value={1}>Brouillon</option>
            <option value={2}>En attente</option>
            <option value={3}>Payée</option>
            <option value={4}>Annulée</option>
            <option value={5}>Impayée</option>
          </select>
          <button
            className="btn btn-accent btn-sm ml-4"
            disabled={isSavedDisabled || isLoading}
            onClick={handleSave}
          >
            {isLoading ? (
              <span className="loading loading-dots loading-sm"></span>
            ) : (
              <>
                Sauvegarder <Save className="w-4 ml-2" />
              </>
            )}
          </button>
          <button className="btn btn-accent btn-sm ml-4" onClick={handleDelete}>
            <Trash className="w-4" />
          </button>
          <button
            className="btn btn-accent btn-sm ml-4"
            onClick={() =>
              (
                document.getElementById("my_modal_2") as HTMLDialogElement
              ).showModal()
            }
          >
            <Calculator className="w-4" />
          </button>
        </div>
      </div>
      <div className="flex flex-col md:flex-row w-full gap-4">
        <div className="flex w-full md:w-1/3 flex-col">
          <div className="mb-4 bg-base-200 rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="badge badge-accent">Résumé des Totaux</div>
              <VatControl invoice={invoice} setInvoice={setInvoice} />
            </div>
            <div className="flex justify-between ">
              <span className="font-bold">Total HT</span>
              <span>{totals?.totalHT.toFixed(2)} DT</span>
            </div>
            <div className="flex justify-between ">
              <span className="font-bold">
                TVA ({invoice?.vatActive ? invoice?.vatRate : 0} %)
              </span>
              <span>{totals?.totalVAT.toFixed(2)} DT</span>
            </div>
            <div className="flex justify-between ">
              <span className="font-bold">Total TTC</span>
              <span>{totals?.totalTTC.toFixed(2)} DT</span>
            </div>
          </div>
          <InvoiceInfo invoice={invoice} setInvoice={setInvoice} />
        </div>
        <div className="flex w-full md:w-2/3 flex-col">
          <InvoiceLines invoice={invoice} setInvoice={setInvoice} />
          <InvoicePdf invoice={invoice} totals={totals} />
        </div>
      </div>

      <dialog id="my_modal_2" className="modal">
        <div className="modal-box bg-black">
          <Calculators />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </Wrapper>
  );
};

export default Page;
