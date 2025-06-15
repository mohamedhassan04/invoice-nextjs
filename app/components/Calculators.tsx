import React, { useState } from "react";
import Keys from "./Keys";

const Calculators = () => {
  const keys = [
    "AC",
    "C",
    "%",
    "/",
    "7",
    "8",
    "9",
    "*",
    "4",
    "5",
    "6",
    "-",
    "1",
    "2",
    "3",
    "+",
    ".",
    "0",
    "=",
  ];

  const [showResult, setShowResult] = useState<boolean>(false);
  const [display, setDisplay] = useState("");

  const maxLimit = 15;

  function calculateResult() {
    if (display.length !== 0) {
      try {
        const processedDisplay = display.replace(/(\d+)%/g, "($1/100)");

        let calcResult = eval(processedDisplay);
        calcResult = parseFloat(calcResult.toFixed(3));
        setDisplay(calcResult);
        setShowResult(true);
      } catch (error) {
        setDisplay("Error");
        console.log("Error calculating result:", error);
      }
    } else setDisplay("");
  }

  function handleButton(value: any) {
    setShowResult(false);
    if (value === "AC") setDisplay("");
    else if (value === "C") setDisplay(display?.slice(0, -1));
    else if (isOperator(value)) {
      if (display == "" || isOperator(display[display.length - 1])) return;
      setDisplay(display + value);
    } else if (value === "=") calculateResult();
    else if (display.length >= maxLimit)
      alert(`maximum characters allowed : ${maxLimit}`);
    else setDisplay(display + value);
  }

  function isOperator(char: any) {
    return ["*", "/", "%"].includes(char);
  }
  const operationClass =
    "text-[1.2rem] tracking-[2px] flex gap-[5px] items-center text-[#FFFFFF] justify-end";
  const resultClass = "text-[1.7rem] text-[#FFFFFF]";
  return (
    <div className="min-w-[320px] bg-black flex flex-col gap-4 p-4 rounded-2xl">
      <div className="overflow-x-auto bg-[#141414] min-h-[100px] flex items-end justify-end flex-col p-4 rounded-[10px]">
        <div className={`${showResult ? resultClass : operationClass}`}>
          {display}
        </div>
      </div>
      <div className="grid grid-cols-[repeat(4,1fr)] gap-[0.3rem]">
        {keys.map((item, index) => (
          <Keys
            label={item}
            key={index}
            keyClass={item === "=" && "equals"}
            onButtonClick={handleButton}
          />
        ))}
      </div>
    </div>
  );
};

export default Calculators;
