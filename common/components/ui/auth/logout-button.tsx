"use client";

import { Button } from "@/components/ui/button";
import { signOut } from "next-auth/react";

const LogoutButton = () => {
  return (
    <Button
      variant={"ghost"}
      size={"lg"}
      className="capitalize"
      onClick={() => signOut()}
    >
      Logout
    </Button>
  );
};

export default LogoutButton;
