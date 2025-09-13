import { useEffect } from "react";
import { toast } from "sonner";

export function useFormFeedback(
  state: { errors: { message: string }[] } | undefined,
  onSuccess?: () => void
) {
  useEffect(() => {
    if (state?.errors?.length) {
      toast.error(state.errors[0].message);
    } else if (onSuccess) {
      onSuccess();
    }
  }, [state]);
}
