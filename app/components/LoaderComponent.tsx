import React from "react";

const LoaderComponent = () => {
  return (
    <div className="fixed top-0 left-0 w-screen h-screen flex justify-center items-center bg-white z-50">
      <span className="loading loading-dots loading-xl text-accent"></span>
    </div>
  );
};

export default LoaderComponent;
