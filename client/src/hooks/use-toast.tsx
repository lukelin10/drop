import { useToast as useToastPrimitive } from "../components/ui/use-toast";
import { Toast } from "../components/ui/toast";

/**
 * Toast notification options
 */
type ToastOptions = Omit<React.ComponentPropsWithoutRef<typeof Toast>, 'children'> & { 
  description?: React.ReactNode;
  action?: React.ReactElement;
  title?: string;
  variant?: "default" | "destructive";
};

/**
 * Simplified toast function
 * This wrapper makes it easier to create toast notifications with a title and description
 */
export const toast = ({ description, ...props }: ToastOptions) => {
  const { toast } = useToastPrimitive();
  return toast({
    ...props,
    description,
  });
};

/**
 * Re-export the useToast hook from the primitive
 */
export const useToast = useToastPrimitive;