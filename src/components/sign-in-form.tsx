"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import type * as z from "zod";
import { login } from "@/actions/login";
import { FormError, FormSuccess } from "@/components/form-notice";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { LogInSchema } from "@/schemas/auth-schema";

export const SignInForm = () => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const searchParams = useSearchParams();
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Email already in use with different provider!"
      : "";

  const form = useForm<z.infer<typeof LogInSchema>>({
    resolver: zodResolver(LogInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LogInSchema>): void => {
    setSuccess("");
    setError("");

    startTransition(async () => {
      await login(values).then((data) => {
        setSuccess(data?.success);
        setError(data?.error);
      });
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <FieldSet>
        <FieldGroup>
          <Controller
            control={form.control}
            name="email"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Email:</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    placeholder="Johnny Bravo"
                    type="email"
                  />
                </InputGroup>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="password"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Password:</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    placeholder={showPassword ? "Your password" : "******"}
                    type={showPassword ? "text" : "password"}
                  />
                  <InputGroupAddon align={"inline-end"}>
                    <Button
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="p-0"
                      onClick={() => setShowPassword((previous) => !previous)}
                      size={"icon"}
                      title={showPassword ? "Hide password" : "Show password"}
                      type="button"
                      variant={"ghost"}
                    >
                      {showPassword ? <Eye /> : <EyeOff />}
                    </Button>
                  </InputGroupAddon>
                </InputGroup>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

          <FormError message={error ?? urlError} />
          <FormSuccess message={success} />

          <Field>
            <Button
              className="w-full cursor-pointer"
              disabled={isPending}
              type="submit"
              variant={"default"}
            >
              Sign In
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );

  // return (
  //   <Form {...form}>
  //     <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
  //       <FormField
  //         control={form.control}
  //         name="email"
  //         render={({ field }) => (
  //           <FormItem>
  //             <FormLabel>Email</FormLabel>
  //             <Input
  //               {...field}
  //               className="mt-1"
  //               id="email"
  //               placeholder="johndoe@example.com"
  //               type="email"
  //             />
  //           </FormItem>
  //         )}
  //       />

  //       <FormField
  //         control={form.control}
  //         name="password"
  //         render={({ field }) => (
  //           <FormItem>
  //             <FormLabel>Password</FormLabel>
  //             <Input
  //               {...field}
  //               className="mt-1"
  //               id="password"
  //               placeholder="******"
  //               type="password"
  //             />
  //           </FormItem>
  //         )}
  //       />
  //       <FormError message={error ?? urlError} />
  //       <FormSuccess message={success} />
  //       <Button
  //         className="w-full cursor-pointer"
  //         disabled={isPending}
  //         type="submit"
  //         variant={"default"}
  //       >
  //         Sign In
  //       </Button>
  //     </form>
  //   </Form>
  // );
};
