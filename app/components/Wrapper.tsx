import React from "react";
import Navbar from "./Navbar";

type WrapperProps = {
  children: React.ReactNode;
};

const Wrapper: React.FC<WrapperProps> = ({ children }) => {
  return (
    <div>
      <Navbar />
      <div className="px-5 md:px-[10%] mt-8 mb-10">{children}</div>
    </div>
  );
};

export default Wrapper;
