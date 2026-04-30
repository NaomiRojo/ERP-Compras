import { useEffect, useRef, useState } from "react";
import { Alert, Box, Button, Card, CardContent, Link, Stack, TextField, Typography } from "@mui/material";

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
    <Card className="auth-card" component="section">
      <CardContent>
        <Stack className="auth-header auth-header--stacked" spacing={2}>
          <Box className="brand-mark brand-mark--soft">2FA</Box>
          <Box>
            <Typography component="h1" variant="h5">
              Verificacion 2FA
            </Typography>
            <Typography color="text.secondary">Ingresa el codigo recibido para continuar.</Typography>
          </Box>
        </Stack>

        <Stack
          className="auth-form"
          component="form"
          onSubmit={(event) => {
            event.preventDefault();
            onConfirm(code);
          }}
        >
          <div className="field-block">
            <Typography color="text.secondary" component="span">
              Codigo de verificacion
            </Typography>
            <div className="code-grid" onPaste={handlePaste}>
              {codeChars.map((char, index) => (
                <TextField
                  key={index}
                  inputRef={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  aria-label={`Digito ${index + 1} del codigo`}
                  autoComplete={index === 0 ? "one-time-code" : "off"}
                  disabled={isSubmitting}
                  onChange={(event) => updateCodeAt(index, event.target.value)}
                  onFocus={(event) => event.target.select()}
                  onKeyDown={(event) =>
                    handleKeyDown(index, event as React.KeyboardEvent<HTMLInputElement>)
                  }
                  slotProps={{
                    htmlInput: {
                      inputMode: "numeric",
                      maxLength: 6,
                      pattern: "[0-9]*",
                    },
                  }}
                  type="text"
                  value={char}
                />
              ))}
            </div>
          </div>

          {previewCode ? (
            <Typography className="auth-feedback auth-feedback--hint" color="text.secondary">
              Codigo de desarrollo: <strong className="mono-code">{previewCode}</strong>
            </Typography>
          ) : null}

          {errorMessage ? (
            <Alert className="auth-feedback auth-feedback--error" severity="error">
              {errorMessage}
            </Alert>
          ) : null}

          <div className="auth-link-row">
            <Link
              className="link-button"
              component="button"
              disabled={isSubmitting}
              onClick={onResend}
              type="button"
              underline="hover"
            >
              Reenviar codigo
            </Link>
          </div>

          <Stack className="stack-actions" spacing={1.5}>
            <Button className="primary-button" disabled={isSubmitting} type="submit" variant="contained">
              {isSubmitting ? "Verificando..." : "Confirmar codigo"}
            </Button>
            <Button
              className="secondary-button"
              disabled={isSubmitting}
              onClick={onBack}
              type="button"
              variant="outlined"
            >
              Volver
            </Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
