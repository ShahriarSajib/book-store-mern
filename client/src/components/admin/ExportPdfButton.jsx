/**
 * components/admin/ExportPdfButton.jsx
 * Reusable admin action that downloads a branded PDF export for a list type.
 */
import { useState } from "react";
import { FaFilePdf } from "react-icons/fa";
import toast from "react-hot-toast";
import Button from "../ui/Button";
import adminApi from "../../services/adminApi";

export default function ExportPdfButton({ type, label = "Download PDF", className }) {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const blob = await adminApi.exportPdf(type);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bookverse-${type}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast.error(
        err?.response?.data?.error?.message || err?.message || "Could not export PDF"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button variant="outline" size="sm" onClick={handleExport} loading={loading} className={className}>
      <FaFilePdf /> {label}
    </Button>
  );
}
