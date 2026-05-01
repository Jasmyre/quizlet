"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import type { JSX } from "react";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import type * as z from "zod";
import { register } from "@/actions/register";
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
import { registerSchema } from "@/schemas/auth-schema";

export const SignupForm = (): JSX.Element => {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<string | undefined>(undefined);
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof registerSchema>): void => {
    setSuccess("");
    setError("");

    startTransition(async () => {
      await register(values).then((data) => {
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
            name="name"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>Name:</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    {...field}
                    disabled={isPending}
                    placeholder="Johnny Bravo"
                  />
                </InputGroup>
                {fieldState.error && <FieldError errors={[fieldState.error]} />}
              </Field>
            )}
          />

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
                    placeholder="johndoe@example.com"
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

          <FormError message={error} />
          <FormSuccess message={success} />

          <Field>
            <Button
              className="w-full cursor-pointer"
              disabled={isPending}
              type="submit"
              variant={"default"}
            >
              Sign Up
            </Button>
          </Field>
        </FieldGroup>
      </FieldSet>
    </form>
  );
};
