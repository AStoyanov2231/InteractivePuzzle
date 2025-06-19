
import React from "react";

export const LoadingScreen: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <h2 className="text-xl font-medium">{message}</h2>
    </div>
  );
};
