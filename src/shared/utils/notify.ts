import { toast } from "sonner";

interface NotifyOptions {
  description?: string;
  duration?: number;
  id?: string | number;
}

function success(message: string, options?: NotifyOptions) {
  return toast.success(message, options);
}

function error(message: string, options?: NotifyOptions) {
  return toast.error(message, options);
}

function info(message: string, options?: NotifyOptions) {
  return toast.info(message, options);
}

function loading(message: string, options?: NotifyOptions) {
  return toast.loading(message, options);
}

function dismiss(id?: string | number) {
  toast.dismiss(id);
}

export const notify = {
  success,
  error,
  info,
  loading,
  dismiss,
};
