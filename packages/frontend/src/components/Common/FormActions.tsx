import { Button, Stack } from "@mui/material";

type FormActionsProps = {
  idlePrimaryLabel: string;
  submittingPrimaryLabel: string;
  isSubmitting: boolean;
  onCancel: () => void;
};

export function FormActions({
  idlePrimaryLabel,
  submittingPrimaryLabel,
  isSubmitting,
  onCancel,
}: FormActionsProps) {
  return (
    <Stack className="inline-form__actions" direction="row" spacing={1.25} useFlexGap>
      <Button className="primary-button" disabled={isSubmitting} type="submit" variant="contained">
        {isSubmitting ? submittingPrimaryLabel : idlePrimaryLabel}
      </Button>
      <Button
        className="secondary-button"
        disabled={isSubmitting}
        onClick={onCancel}
        type="button"
        variant="outlined"
      >
        Cancelar
      </Button>
    </Stack>
  );
}
