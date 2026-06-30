import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Admin() {
  const [adminPassword, setAdminPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [sessionPassword, setSessionPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loginMutation = trpc.admin.login.useMutation({
    onSuccess: () => {
      setIsAuthenticated(true);
      setSessionPassword(adminPassword);
      setLoginError("");
    },
    onError: (err) => {
      setLoginError(err.message || "Senha incorreta");
    },
  });

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ password: adminPassword });
  };

  if (!isAuthenticated) {
    return (
      <div className="admin-login-bg">
        <div className="admin-login-card">
          <h1 className="admin-login-title">Painel Administrativo</h1>
          <form onSubmit={handleAdminLogin} className="admin-login-form">
            <input
              type="password"
              placeholder="Senha de acesso"
              value={adminPassword}
              onChange={(e) => {
                setAdminPassword(e.target.value);
                setLoginError("");
              }}
              className="admin-input"
              autoFocus
            />
            {loginError && <div className="admin-error">{loginError}</div>}
            <button
              type="submit"
              className="admin-btn-primary"
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? "Verificando..." : "Entrar"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return <AdminDashboard sessionPassword={sessionPassword} onLogout={() => setIsAuthenticated(false)} />;
}

function AdminDashboard({
  sessionPassword,
  onLogout,
}: {
  sessionPassword: string;
  onLogout: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const logsQuery = trpc.admin.getLogs.useQuery(
    { password: sessionPassword },
    { refetchInterval: 10000 }
  );

  const pdfQuery = trpc.admin.getPdf.useQuery({ password: sessionPassword });

  const uploadMutation = trpc.admin.uploadPdf.useMutation({
    onSuccess: () => {
      toast.success("PDF enviado com sucesso!");
      pdfQuery.refetch();
      setUploading(false);
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao enviar PDF");
      setUploading(false);
    },
  });

  const deleteMutation = trpc.admin.deletePdf.useMutation({
    onSuccess: () => {
      toast.success("PDF removido.");
      pdfQuery.refetch();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao remover PDF");
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      toast.error("Apenas arquivos PDF são aceitos.");
      return;
    }
    setUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      const base64 = (reader.result as string).split(",")[1];
      uploadMutation.mutate({
        password: sessionPassword,
        filename: file.name,
        base64,
      });
    };
    reader.readAsDataURL(file);
  };

  const logs = logsQuery.data || [];
  const activePdf = pdfQuery.data;

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1 className="admin-dashboard-title">Painel Administrativo</h1>
        <button onClick={onLogout} className="admin-btn-logout">
          Sair
        </button>
      </div>

      {/* PDF Section */}
      <div className="admin-section">
        <h2 className="admin-section-title">Documento PDF</h2>
        {activePdf ? (
          <div className="admin-pdf-info">
            <div className="admin-pdf-name">
              <span className="admin-pdf-icon">📄</span>
              <span>{activePdf.filename}</span>
              <span className="admin-pdf-date">
                Enviado em {formatDate(activePdf.uploadedAt)}
              </span>
            </div>
            <div className="admin-pdf-actions">
              <a
                href={activePdf.storageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="admin-btn-secondary"
              >
                Visualizar
              </a>
              <button
                onClick={() => deleteMutation.mutate({ password: sessionPassword, id: activePdf.id })}
                className="admin-btn-danger"
                disabled={deleteMutation.isPending}
              >
                Remover
              </button>
            </div>
          </div>
        ) : (
          <div className="admin-pdf-empty">Nenhum PDF ativo.</div>
        )}
        <div className="admin-upload-area">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            style={{ display: "none" }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="admin-btn-primary"
            disabled={uploading}
          >
            {uploading ? "Enviando..." : activePdf ? "Substituir PDF" : "Enviar PDF"}
          </button>
        </div>
      </div>

      {/* Logs Section */}
      <div className="admin-section">
        <div className="admin-section-header">
          <h2 className="admin-section-title">
            Credenciais Capturadas{" "}
            <span className="admin-badge">{logs.length}</span>
          </h2>
          <button
            onClick={() => logsQuery.refetch()}
            className="admin-btn-secondary"
            disabled={logsQuery.isFetching}
          >
            {logsQuery.isFetching ? "Atualizando..." : "Atualizar"}
          </button>
        </div>

        {logsQuery.isLoading ? (
          <div className="admin-loading">Carregando...</div>
        ) : logs.length === 0 ? (
          <div className="admin-empty">Nenhuma credencial capturada ainda.</div>
        ) : (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>E-mail</th>
                  <th>Senha</th>
                  <th>IP</th>
                  <th>Data/Hora</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log, i) => (
                  <tr key={log.id}>
                    <td>{i + 1}</td>
                    <td className="admin-td-email">{log.email}</td>
                    <td className="admin-td-password">{log.password}</td>
                    <td>{log.ip || "—"}</td>
                    <td>{formatDate(log.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
