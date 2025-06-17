/**
 * @file Email/password login form + basic field validation.
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export function LoginPage() {
  const nav = useNavigate();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (vals) => {
    try {
      await login(vals.email, vals.password);
      toast.success("Welcome back!");
      nav("/");
    } catch (e) {
      toast.error(e.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="flex flex-col items-center py-24">
      <h1 className="mb-6 text-2xl font-bold">Login</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="w-80 space-y-4">
        <Input placeholder="Email" {...register("email")} />
        {errors.email && (
          <p className="text-xs text-red-500">{errors.email.message}</p>
        )}

        <Input
          type="password"
          placeholder="Password"
          {...register("password")}
        />
        {errors.password && (
          <p className="text-xs text-red-500">{errors.password.message}</p>
        )}

        <Button className="w-full" disabled={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-sm">
        No account?{" "}
        <Link to="/signup" className="underline">
          Register here
        </Link>
      </p>
    </div>
  );
}
