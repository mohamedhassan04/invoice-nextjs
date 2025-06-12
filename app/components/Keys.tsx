import React from "react";

interface KeysProps {
  label: string;
  keyClass: any;
  onButtonClick: (label: string) => void;
}

const Keys: React.FC<KeysProps> = ({ label, keyClass, onButtonClick }) => {
  const equalClass =
    "col-[span_2] bg-[#4ccdc6] text-[#FFFFFF] font-semibold hover:bg-[#4CCDC6]";
  return (
    <div
      className={`bg-[#141414] flex cursor-pointer text-[#FFFFFF] items-center justify-center p-4 rounded-[5px] hover:bg-accent ${
        keyClass && equalClass
      }`}
      onClick={() => onButtonClick(label)}
    >
      {label}
    </div>
  );
};

export default Keys;
