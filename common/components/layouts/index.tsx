import { FC } from "react";

import { Toaster } from "react-hot-toast";

import { ILayoutsProps } from "@/common/types";

const Layouts: FC<ILayoutsProps> = ({ children }) => {
  return (
    <>
      {children}
      <Toaster position="top-right" reverseOrder={false} />
    </>
  );
};

export default Layouts;
