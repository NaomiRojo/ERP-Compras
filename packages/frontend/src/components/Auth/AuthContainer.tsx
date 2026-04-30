import type { SessionPersistence } from "../../utils/session";
import { LoginCard } from "./LoginCard";
import { TwoFactorCard } from "./TwoFactorCard";

type LoginSubmitPayload = {
  email: string;
  password: string;
  persistence: SessionPersistence;
  twoFactorChannel?: "EMAIL" | "SMS" | "WHATSAPP" | "VOICE";
  twoFactorPhoneNumber?: string;
};

type RegisterSubmitPayload = {
  username: string;
  nombreCompleto: string;
  email: string;
  password: string;
  twoFactorEnabled: boolean;
};

type AuthContainerProps = {
  step: "login" | "two-factor";
  isSubmitting: boolean;
  errorMessage: string | null;
  challengeId?: string;
  previewCode?: string;
  onSubmitLogin: (payload: LoginSubmitPayload) => void;
  onSubmitRegister: (payload: RegisterSubmitPayload) => Promise<void>;
  onBackToLogin: () => void;
  onConfirmTwoFactor: (code: string) => void;
  onResendTwoFactor: () => void;
};

export function AuthContainer({
  step,
  isSubmitting,
  errorMessage,
  challengeId,
  previewCode,
  onSubmitLogin,
  onSubmitRegister,
  onBackToLogin,
  onConfirmTwoFactor,
  onResendTwoFactor,
}: AuthContainerProps) {
  return (
    <main className="auth-screen">
      {step === "login" ? (
        <LoginCard
          errorMessage={errorMessage}
          isSubmitting={isSubmitting}
          onSubmitLogin={onSubmitLogin}
          onSubmitRegister={onSubmitRegister}
        />
      ) : (
        <TwoFactorCard
          challengeId={challengeId}
          errorMessage={errorMessage}
          isSubmitting={isSubmitting}
          onBack={onBackToLogin}
          onConfirm={onConfirmTwoFactor}
          onResend={onResendTwoFactor}
          previewCode={previewCode}
        />
      )}
    </main>
  );
}
