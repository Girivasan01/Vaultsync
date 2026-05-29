import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { login } from '../api/auth.api.js';
import AuthLayout from '../layouts/AuthLayout.jsx';
import { useAuthStore } from '../store/auth.store.js';
import Button from '../components/ui/Button.jsx';
import { Card } from '../components/ui/Card.jsx';

const schema = z.object({ email: z.string().email(), password: z.string().min(1) });

export default function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((state) => state.setSession);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({ resolver: zodResolver(schema) });

  const submit = async (values) => {
    try {
      const session = await login(values);
      setSession(session);
      toast.success('Signed in');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Login failed');
    }
  };

  return (
    <AuthLayout>
      <Card>
        <form className="space-y-4" onSubmit={handleSubmit(submit)}>
          <label className="block space-y-1 text-sm">Email<input className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950" {...register('email')} />{errors.email ? <span className="text-xs text-coral">{errors.email.message}</span> : null}</label>
          <label className="block space-y-1 text-sm">Password<input type="password" className="w-full rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-950" {...register('password')} />{errors.password ? <span className="text-xs text-coral">{errors.password.message}</span> : null}</label>
          <Button type="submit" className="w-full" loading={isSubmitting}>Sign In</Button>
        </form>
      </Card>
    </AuthLayout>
  );
}
