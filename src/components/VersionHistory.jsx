import { useCallback, useEffect, useState, forwardRef, useImperativeHandle, useRef } from "react";
import { History, Clock, User, FileText } from 'lucide-react';
// import { API_BASE_URL } from "../config/apiconfig";
import apiClient from "../service/apiclient";
import { motion } from "framer-motion";
import { showSuccess, showError } from "../utils/toast";
import { useModal } from "../utils/modals/useModal";
import { useNavigate } from "react-router-dom";

const VersionHistory = forwardRef(({
  documentId,
  selectedVersionId,
  refreshTrigger,
  onCompare,
  compareVersions
}, ref) => {
  useImperativeHandle(ref, () => ({
    refreshVersions: fetchVersions,
    getLatestVersionId: () => versions[0]?.id,
    getVersions: () => versions   // ✅ ADD THIS
  }));

  const [versions, setVersions] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const { showConfirm } = useModal();
  const [compareFrom, setCompareFrom] = useState(null);

  const latestVersionRef = useRef(0);
  const versionsRef = useRef([]);
  const navigate = useNavigate();

  const handleDocumentClick = (id) => {
    navigate(`/document/${id}`);
  };
  const handleVersionClick = (versionId) => {
    console.log("📌 Version clicked:", versionId);
    navigate(`/document/${documentId}/version/${versionId}`);
  };
  const deleteHandlers = {
    document: async (id) => {
      await apiClient.delete(`/document/${id}`);
      setDocuments(prev => prev.filter(d => d.id !== id));
      if (id === documentId) navigate('/');
      showSuccess("Document deleted successfully!");
    },
    version: async (id) => {
      await apiClient.delete(`/document/${documentId}/versions/${id}`);
      setVersions(prev => {
        const nextVersions = prev.filter(v => v.id !== id);
        versionsRef.current = nextVersions;
        return nextVersions;
      });
      if (selectedVersionId === id) {
        navigate(`/document/${documentId}`); // ✅ fix selection
      }

      showSuccess("Version deleted successfully!");
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleString();


  // 📂 Fetch all documents
  useEffect(() => {
    console.log("📂 FetchDocs useEffect TRIGGERED", {
      refreshTrigger
    });
    const fetchDocs = async () => {
      try {
        setLoadingDocs(true);


        console.log("📡 Fetching document list...");

        const res = await apiClient.get(`/document`);
        console.log("✅ Documents received:", res.data.data);

        setDocuments(res.data.data || []);
      } catch (err) {
        console.error("Could not fetch documents:", err);
        showError("Failed to load documents");
      } finally {
        setLoadingDocs(false);
      }
    };

    fetchDocs();
  }, [refreshTrigger]);
  const fetchVersions = useCallback(async () => {
    if (!documentId) {
      setVersions([]);
      versionsRef.current = [];
      return { hasNewVersion: false, latestVersionId: null };
    }

    try {
      setLoadingVersions(true);

      const res = await apiClient.get(`/document/${documentId}/versions`);
      const newData = res.data.data || [];
      const newLatest = newData[0]?.versionNumber || 0;
      const latestVersionId = newData[0]?.id || null;
      const previousVersions = versionsRef.current;
      console.log("📊 OLD versions state:", versions);
      console.log("📊 NEW API data:", newData);

      const prevLatest = latestVersionRef.current;

      console.log("🧠 prevLatest (ref):", prevLatest);
      console.log("🧠 newLatest:", newLatest);

      const hasNewVersion =
        newData.length > previousVersions.length ||
        newLatest > prevLatest;

      console.log("🚨 hasNewVersion:", hasNewVersion);

      setVersions(newData);
      versionsRef.current = newData;
      latestVersionRef.current = newLatest;

      return { hasNewVersion, latestVersionId };

    } catch {
      showError("Failed to load version history");
      return { hasNewVersion: false, latestVersionId: null };
    } finally {
      setLoadingVersions(false);
    }
  // The logged `versions` value is diagnostic only; version comparison uses versionsRef.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [documentId]);

  // 🕒 Fetch version history
  useEffect(() => {
    fetchVersions();
  }, [fetchVersions]);
  const handleCompareClick = (version) => {
    if (!compareFrom) {
      setCompareFrom(version);
    } else {
      // Trigger compare
      onCompare(compareFrom, version);
      setCompareFrom(null);
    }
  };

  return (
    <div
      className="glass-panel"
      style={{
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        height: '100%',
        overflow: 'hidden'
      }}
    >

      {/* ================= DOCUMENT LIST ================= */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <FileText size={20} /> Uploaded Documents
        </h3>

        <div
          style={{
            overflowY: 'auto',
            maxHeight: '150px',
            paddingRight: '0.5rem'
          }}
        >
          {loadingDocs ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Loading documents...
            </p>
          ) : documents?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No documents uploaded yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {documents.map((doc, index) => (
                <div
                  key={doc.id}
                  className="animate-fade-in"
                  style={{
                    padding: '0.75rem 1rem',
                    background: documentId === doc.id ? 'rgba(99, 102, 241, 0.25)' : 'rgba(0,0,0,0.2)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    borderLeft: documentId === doc.id ? '3px solid var(--primary)' : '3px solid transparent',
                    animationDelay: `${index * 0.05}s`
                  }}
                  onMouseEnter={(e) => {
                    if (documentId !== doc.id) e.currentTarget.style.background = 'rgba(255,255,255,0.08)';
                  }}
                  onMouseLeave={(e) => {
                    if (documentId !== doc.id) e.currentTarget.style.background = 'rgba(0,0,0,0.2)';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div onClick={() => handleDocumentClick(doc.id)}>📄 {doc.fileName}</div>
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();

                        showConfirm({
                          title: "Delete Document",
                          message: (
                            <>
                              Are you sure you want to delete <b>{doc.fileName}</b>?
                              <br />
                              <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                                This action cannot be undone.
                              </span>
                            </>
                          ),
                          onConfirm: async () => {
                            await deleteHandlers.document(doc.id);
                          }
                        });
                      }}
                      whileHover={{ rotate: 10, y: -5 }}
                      whileTap={{ rotate: 0, y: 0 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      style={{
                        color: "red",
                        border: "none",
                        background: "transparent",   // ✅ IMPORTANT
                        cursor: "pointer",
                        fontSize: "1rem",
                        padding: 0,                  // ✅ remove default padding
                        outline: "none"              // ✅ remove focus ring bg
                      }}
                    >
                      🗑️
                    </motion.button>
                  </div>
                </div>
              ))}
            </div>

          )}
        </div>
      </div>

      {/* ================= VERSION HISTORY ================= */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600 }}>
          <History size={20} /> Version History
        </h3>

        <div
          style={{
            overflowY: 'auto',
            maxHeight: '300px',
            paddingRight: '0.5rem'
          }}
        >
          {!documentId ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Select a document to view history
            </p>
          ) : loadingVersions ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Loading versions...
            </p>
          ) : versions?.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              No alternate versions yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {versions.map((v, index) => {
                const isSelected =
                  selectedVersionId === v.id ||
                  (selectedVersionId === null && index === 0);

                return (
                  <div
                    key={v.id}
                    onClick={() => handleVersionClick(v.id)}
                    className="animate-fade-in"
                    style={{
                      padding: '1rem',
                      background: isSelected
                        ? 'rgba(99, 102, 241, 0.35)'
                        : 'rgba(0,0,0,0.2)',
                      borderRadius: 'var(--radius-md)',
                      borderLeft: isSelected
                        ? '4px solid var(--primary)'
                        : index === 0
                          ? '4px solid #22c55e'
                          : '4px solid transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      transform: isSelected ? 'scale(1.02)' : 'scale(1)',
                      boxShadow: isSelected ? '0 0 10px rgba(99,102,241,0.4)' : 'none',
                      animationDelay: `${index * 0.1}s`
                    }}
                  >

                    {/* HEADER */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: 600 }}>
                        Version {v.versionNumber}
                      </span>

                      <div style={{ display: 'flex', gap: '0.3rem' }}>
                        {index === 0 && (
                          <span style={{
                            fontSize: '0.7rem',
                            background: '#22c55e',
                            padding: '0.1rem 0.5rem',
                            borderRadius: '10px'
                          }}>
                            Latest
                          </span>
                        )}

                        {isSelected && (
                          <span style={{
                            fontSize: '0.7rem',
                            background: 'var(--primary)',
                            padding: '0.1rem 0.5rem',
                            borderRadius: '10px'
                          }}>
                            Viewing
                          </span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCompareClick(v);
                        }}
                        style={{
                          fontSize: "11px",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          background: compareFrom?.id === v.id
                            ? "#f59e0b"
                            : "rgba(255,255,255,0.1)",
                          color: "#fff",
                          border: "none",
                          cursor: "pointer"
                        }}
                      >
                        {compareFrom?.id === v.id ? "Selected" : "Compare"}
                      </button>
                      <motion.button
                        onClick={(e) => {
                          e.stopPropagation();
                          // 🚫 Block if in compare mode
                          if (
                            compareVersions &&
                            (compareVersions.left?.id === v.id ||
                              compareVersions.right?.id === v.id)
                          ) {
                            showError("Cannot delete version while it is in compare mode.");
                            return;
                          }

                          // 🚫 Block original version
                          if (v.versionNumber === 1) {
                            showError("Cannot delete original version.");
                            return;
                          }
                          showConfirm({
                            title: "Delete Version",
                            message: (
                              <>
                                Are you sure you want to delete <b>Version {v.versionNumber}</b>?
                                <br />
                                <span style={{ fontSize: "0.8rem", opacity: 0.7 }}>
                                  This action cannot be undone.
                                </span>
                              </>
                            ),
                            onConfirm: async () => {
                              await deleteHandlers.version(v.id);
                            }
                          });
                        }}
                        whileHover={{ rotate: 10, y: -5 }}
                        whileTap={{ rotate: 0, y: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        style={{
                          color: v.versionNumber === 1 ? "#94a3b8" : "red",
                          border: "none",
                          background: "transparent",
                          cursor: "pointer",
                          fontSize: "1rem",
                          padding: 0,
                          outline: "none"
                        }}
                        title={v.versionNumber === 1 ? "Original version cannot be deleted" : "Delete"}
                      >
                        {v.versionNumber === 1 ? "🔒" : "🗑️"}
                      </motion.button>

                    </div>

                    {/* USER */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      marginBottom: '0.25rem'
                    }}>
                      <User size={12} /> {v.modifiedBy}
                    </div>

                    {/* TIME */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)'
                    }}>
                      <Clock size={12} /> {formatDate(v.modifiedAt)}
                    </div>

                    {/* OPTIONAL: SIMPLE LABEL */}
                    <div style={{
                      marginTop: '0.5rem',
                      fontSize: '0.75rem',
                      color: '#a5b4fc'
                    }}>
                      {v.versionNumber === 1
                        ? "Original document"
                        : `Edited from version ${v.parentVersionNumber ?? "-"}`
                      }
                    </div>

                  </div>

                );
              })}
            </div>

          )}
        </div>
      </div>

    </div>
  );
});

VersionHistory.displayName = "VersionHistory";

export default VersionHistory;
