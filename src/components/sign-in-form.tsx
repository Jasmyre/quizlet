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
                    disabled={isPending}
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
                    disabled={isPending}
                    placeholder={showPassword ? "Your password" : "******"}
                    type={showPassword ? "text" : "password"}
                  />
                  <InputGroupAddon align={"inline-end"}>
                    <Button
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      className="p-0"
                      disabled={isPending}
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
};
