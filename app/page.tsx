"use client";
import { FilePlus } from "lucide-react";
import Wrapper from "./components/Wrapper";
import { useEffect, useState } from "react";
import { createEmptyInvoice, getInvoicesByEmail } from "./actions/actions";
import { useUser } from "@clerk/nextjs";
import confetti from "canvas-confetti";
import { Invoice } from "@/types/type";
import InvoiceComponent from "./components/InvoiceComponent";

export default function Home() {
  const { user } = useUser();
  const [invoiceName, setInvoiceName] = useState<string>("");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isNameValid, setIsNameValid] = useState<boolean>(true);
  const [touched, setTouched] = useState<boolean>(false);

  const email = user?.primaryEmailAddress?.emailAddress as string;
  const fetchInvoices = async () => {
    try {
      const data = await getInvoicesByEmail(email);
      if (data) {
        setInvoices(data);
      }
    } catch (error) {
      console.log("Error fetching invoices:", error);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [email]);

  useEffect(() => {
    if (touched) {
      setIsNameValid(invoiceName.length >= 6);
    }
  }, [invoiceName, touched]);

  const handleCreateInvoice = async () => {
    try {
      if (email) {
        await createEmptyInvoice(email, invoiceName);
        await fetchInvoices();
        setInvoiceName("");
        setTouched(false);
      }
      const modal = document.getElementById("my_modal_3") as HTMLDialogElement;
      if (modal) {
        modal.close();
      }
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        zIndex: 9999,
      });
    } catch (error) {
      console.log("Error creating invoice:", error);
    }
  };

  return (
    <Wrapper>
      <div className="flex flex-col space-y-4">
        <h1 className="text-lg font-bold">Mes factures</h1>
        <div className="grid md:grid-cols-3 gap-4">
          <div
            className="cursor-pointer border border-accent rounded-xl flex justify-center items-center flex-col p-5"
            onClick={() =>
              (
                document.getElementById("my_modal_3") as HTMLDialogElement
              ).showModal()
            }
          >
            <div className="font-bold text-accent">Créer une facture</div>
            <div className="bg-accent-content text-accent rounded-full p-2 mt-2">
              <FilePlus />
            </div>
          </div>
          {invoices.length > 0 &&
            invoices.map((invoice, index) => (
              <div key={index}>
                <InvoiceComponent invoice={invoice} index={index} />
              </div>
            ))}
        </div>
        <dialog id="my_modal_3" className="modal">
          <div className="modal-box">
            <form method="dialog">
              <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
                ✕
              </button>
            </form>
            <h3 className="font-bold text-lg">Nouvelle facture</h3>
            <input
              type="text"
              placeholder="Nom de la facture..."
              className="input input-bordered w-full my-4"
              value={invoiceName}
              onChange={(e) => setInvoiceName(e.target.value)}
              onFocus={() => setTouched(true)}
            />
            {!isNameValid && touched && (
              <p className="text-red-500 text-sm mb-2 transition-all ease-in-out">
                Le nom de la facture doit contenir au moins 6 caractères.
              </p>
            )}
            <button
              className="btn btn-accent"
              disabled={!isNameValid || invoiceName.length < 6}
              onClick={handleCreateInvoice}
            >
              Créer
            </button>
          </div>
        </dialog>
      </div>
    </Wrapper>
  );
}
