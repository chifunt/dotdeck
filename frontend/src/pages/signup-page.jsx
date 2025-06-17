/**
 * @file Registration form – username/e-mail/password, zod-validated.
 */

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const schema = z.object({
  username: z.string().min(3),
  email: z.string().email(),
  password: z.string().min(6),
});

export function SignupPage() {
  const { signup } = useAuth();
  const nav = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (vals) => {
    try {
      await signup(vals);
      toast.success("Account created – welcome!");
      nav("/");
    } catch (e) {
      toast.error(e.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div className="flex flex-col items-center py-24">
      <h1 className="mb-6 text-2xl font-bold">Sign up</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="w-80 space-y-4">
        <Input placeholder="Username" {...register("username")} />
        {errors.username && (
          <p className="text-xs text-red-500">{errors.username.message}</p>
        )}

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
          Create account
        </Button>
      </form>

      <p className="mt-6 text-sm">
        Already have an account?{" "}
        <Link to="/login" className="underline">
          Login
        </Link>
      </p>
    </div>
  );
}
