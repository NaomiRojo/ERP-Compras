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
    <div className="inline-form__actions">
      <button className="primary-button" disabled={isSubmitting} type="submit">
        {isSubmitting ? submittingPrimaryLabel : idlePrimaryLabel}
      </button>
      <button
        className="secondary-button"
        disabled={isSubmitting}
        onClick={onCancel}
        type="button"
      >
        Cancelar
      </button>
    </div>
  );
}
