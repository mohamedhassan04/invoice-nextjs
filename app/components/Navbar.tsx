"use client";
import { UserButton, useUser } from "@clerk/nextjs";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Layers } from "lucide-react";
import React, { useEffect } from "react";
import { checkAndAddUser } from "../actions/actions";

const Navbar = () => {
  const pathname = usePathname();
  const { user } = useUser();
  const navLink = [{ label: "Factures", href: "/" }];

  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress && user?.fullName) {
      checkAndAddUser(user.primaryEmailAddress.emailAddress, user.fullName);
    }
  }, [user]);

  // Function to check if the current path matches the link's href
  const isActiveLink = (href: string) => {
    return pathname.replace(/\/$/, "") === href.replace(/\/$/, "");
  };

  const renderLinks = (classnames: string) =>
    navLink.map(({ href, label }) => {
      return (
        <Link
          href={href}
          key={href}
          className={`btn-sm  ${classnames} ${
            isActiveLink(href) ? "btn-accent" : ""
          }`}
        >
          {label}
        </Link>
      );
    });

  return (
    <div className="border-b border-base-300 px-5 md:px-[10%] py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-accent-content text-accent rounded-full p-2">
            <Layers />
          </div>
          <span className="text-2xl font-bold italic">
            In<span className="text-accent">Voice</span>
          </span>
        </div>
        <div className="flex items-center gap-2 space-x-4">
          {renderLinks("btn")} <UserButton />
        </div>
      </div>
      <div></div>
    </div>
  );
};

export default Navbar;
