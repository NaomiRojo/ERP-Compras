import { useEffect, useRef, useState } from "react";

type TwoFactorCardProps = {
  challengeId?: string;
  isSubmitting: boolean;
  errorMessage: string | null;
  previewCode?: string;
  onBack: () => void;
  onConfirm: (code: string) => void;
  onResend: () => void;
};

export function TwoFactorCard({
  challengeId,
  isSubmitting,
  errorMessage,
  previewCode,
  onBack,
  onConfirm,
  onResend,
}: TwoFactorCardProps) {
  const [code, setCode] = useState(previewCode ?? "");
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setCode(previewCode ?? "");
  }, [challengeId, previewCode]);

  const codeChars = Array.from({ length: 6 }, (_, index) => code[index] ?? "");

  const focusInput = (index: number) => {
    inputRefs.current[index]?.focus();
    inputRefs.current[index]?.select();
  };

  const updateCodeAt = (index: number, rawValue: string) => {
    const digits = rawValue.replace(/\D/g, "");
    const nextChars = [...codeChars];

    if (!digits) {
      nextChars[index] = "";
      setCode(nextChars.join(""));
      return;
    }

    digits
      .slice(0, Math.max(0, 6 - index))
      .split("")
      .forEach((digit, offset) => {
        nextChars[index + offset] = digit;
      });

    setCode(nextChars.join(""));
    focusInput(Math.min(index + digits.length, 5));
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !codeChars[index] && index > 0) {
      focusInput(index - 1);
    }

    if (event.key === "ArrowLeft" && index > 0) {
      event.preventDefault();
      focusInput(index - 1);
    }

    if (event.key === "ArrowRight" && index < 5) {
      event.preventDefault();
      focusInput(index + 1);
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const pastedDigits = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pastedDigits) {
      return;
    }

    setCode(pastedDigits);
    focusInput(Math.min(pastedDigits.length - 1, 5));
  };

  return (
    <section className="auth-card">
      <div className="auth-header auth-header--stacked">
        <div className="brand-mark brand-mark--soft">2FA</div>
        <div>
          <h1>Verificacion 2FA</h1>
          <p>Ingresa el codigo recibido para continuar.</p>
        </div>
      </div>

      <form
        className="auth-form"
        onSubmit={(event) => {
          event.preventDefault();
          onConfirm(code);
        }}
      >
        <div className="field-block">
          <span>Codigo de verificacion</span>
          <div className="code-grid" onPaste={handlePaste}>
            {codeChars.map((char, index) => (
              <input
                key={index}
                ref={(element) => {
                  inputRefs.current[index] = element;
                }}
                aria-label={`Digito ${index + 1} del codigo`}
                autoComplete={index === 0 ? "one-time-code" : "off"}
                disabled={isSubmitting}
                inputMode="numeric"
                maxLength={6}
                onChange={(event) => updateCodeAt(index, event.target.value)}
                onFocus={(event) => event.target.select()}
                onKeyDown={(event) => handleKeyDown(index, event)}
                pattern="[0-9]*"
                type="text"
                value={char}
              />
            ))}
          </div>
        </div>

        {previewCode ? (
          <p className="auth-feedback auth-feedback--hint">
            Codigo de desarrollo: <strong className="mono-code">{previewCode}</strong>
          </p>
        ) : null}

        {errorMessage ? <p className="auth-feedback auth-feedback--error">{errorMessage}</p> : null}

        <div className="auth-link-row">
          <button className="link-button" disabled={isSubmitting} onClick={onResend} type="button">
            Reenviar codigo
          </button>
        </div>

        <div className="stack-actions">
          <button className="primary-button" disabled={isSubmitting} type="submit">
            {isSubmitting ? "Verificando..." : "Confirmar codigo"}
          </button>
          <button className="secondary-button" disabled={isSubmitting} onClick={onBack} type="button">
            Volver
          </button>
        </div>
      </form>
    </section>
  );
}
