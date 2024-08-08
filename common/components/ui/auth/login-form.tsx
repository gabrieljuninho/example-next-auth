"use client";

import { useTransition, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import { login } from "@/actions/login";

import { LoginSchema } from "@/schemas";

const LoginForm = () => {
  const [isPending, startTransition] = useTransition();
  const [isTwoFactor, setTwoFactor] = useState(false);

  const urlParams = useSearchParams();
  const callBackUrl = urlParams.get("callbackUrl");
  const errorUrlParam =
    urlParams.get("error") === "OAuthAccountNotLinked"
      ? "This account is already linked to a user. Please sign in with a different account."
      : "";

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    startTransition(() => {
      login(values, callBackUrl)
        .then((data) => {
          if (data?.error) {
            form.reset();

            toast.error(data.error);
          }
          if (data?.success) {
            form.reset();

            toast.success(data?.success);
          }
          if (data?.twoFactor) {
            console.log(data.twoFactor);

            setTwoFactor(true);
          }
        })
        .catch((err) => {
          toast.error("Something went wrong.");
        });
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
        {!isTwoFactor && (
          <>
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="email"
                      placeholder="johndoe@example.com"
                      autoComplete="off"
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      placeholder="******"
                      autoComplete="off"
                      disabled={isPending}
                    />
                  </FormControl>
                  <Button
                    size={"sm"}
                    variant={"link"}
                    asChild
                    className="px-0 font-normal"
                  >
                    <Link href="/auth/reset">Forgot Password?</Link>
                  </Button>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        {isTwoFactor && (
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Two Factor Code</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="123456"
                    autoComplete="off"
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}
        {errorUrlParam && <p>{errorUrlParam}</p>}
        <Button type="submit" className="w-full" disabled={isPending}>
          {isTwoFactor ? "Confirm" : "Login"}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
