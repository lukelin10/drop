import { 
  ToastActionElement, 
  ToastProps 
} from '@/components/ui/toast';
import {
  toast as showToast,
  useToast as useToastPrimitive,
} from '@/components/ui/use-toast';

type ToastOptions = Omit<ToastProps, 'children'> & { 
  description?: React.ReactNode;
  action?: ToastActionElement 
};

export const toast = ({ description, ...props }: ToastOptions) => {
  return showToast({
    ...props,
    description,
  });
};

export const useToast = useToastPrimitive;