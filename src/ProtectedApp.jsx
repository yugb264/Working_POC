import { useState, useEffect, useRef } from "react";
import UploadFile from "./components/UploadFile";
import VersionHistory from "./components/VersionHistory";
import Editor from "./components/Editor";
import { useMsal } from "@azure/msal-react";
import { ModalProvider } from "./utils/modals/ModalProvider";
import { startConnection, getConnection } from "./service/signalrService";

export default function ProtectedApp() {
  const [activeDoc, setActiveDoc] = useState(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { instance } = useMsal();
  const versionRef = useRef();
  const [compareMode, setCompareMode] = useState(false);
  const [compareVersions, setCompareVersions] = useState(null);
  const safeSetActiveDoc = (doc) => {
    console.log("🧠 Setting activeDoc:", doc);

    // ✅ EXIT compare mode when switching
    setCompareMode(false);
    setCompareVersions(null);

    setActiveDoc({
      documentId: doc?.documentId ?? null,
      versionId: doc?.versionId ?? null
    });
  };
  const handleLogout = () => {
    instance.logoutRedirect();
  };

  const handleUploadSuccess = (doc) => {
    console.log("📤 Upload success:", doc);

    // ✅ 1. Open editor FIRST
    safeSetActiveDoc({
      documentId: doc.documentId ?? doc.id,
      versionId: null
    });

    // ✅ 2. Then refresh sidebar AFTER slight delay
    setTimeout(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 100);
  };

  const handleCompare = (v1, v2) => {
    console.log("⚖️ Compare mode ON", v1, v2);

    setCompareVersions({
      left: v1,
      right: v2
    });

    setCompareMode(true);
  };


  useEffect(() => {
    let conn;

    const init = async () => {
      conn = await startConnection();
    };

    init();

    return () => {
      conn?.stop();
    };
  }, []);

  useEffect(() => {
    const conn = getConnection();

    if (!conn || !activeDoc?.documentId) return;

    const docId = activeDoc.documentId.toString();

    if (conn.state !== "Connected") {
      console.log("⏳ Waiting for SignalR connection...");
      return;
    }

    console.log("📡 Joining SignalR group:", docId);

    conn.invoke("JoinDocumentGroup", docId);

    conn.on("DocumentUpdated", async (data) => {
      console.log("🔥 Real-time update received:", data);

      if (data.documentId === activeDoc.documentId) {
        const refreshResult = await versionRef.current?.refreshVersions?.();

        if (refreshResult?.hasNewVersion) {

          console.log("🚀 Switching to latest version");
          const latestVersionId =
            refreshResult.latestVersionId ??
            await versionRef.current?.getLatestVersionId?.();
          // 2. AUTO SWITCH to latest version
          safeSetActiveDoc({
            documentId: data.documentId,
            versionId: latestVersionId  // null = latest
          });
        }
      }
    });

    return () => {
      console.log("🚪 Leaving group:", docId);
      conn.invoke("LeaveDocumentGroup", docId);
      conn.off("DocumentUpdated");
    };
  }, [activeDoc?.documentId]);
  return (
    <ModalProvider>
      <div
        style={{
          height: "100vh",
          display: "flex",
          flexDirection: "column"
        }}
      >

        {/* HEADER */}
        <div
          style={{
            height: 60,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 20px",
            background: "rgba(255,255,255,0.05)",
            backdropFilter: "blur(10px)",
            borderBottom: "1px solid rgba(255,255,255,0.1)"
          }}
        >
          <h2 style={{ margin: 0 }}>📄 MyOffice Docs</h2>

          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              padding: "8px 14px",
              borderRadius: "8px",
              border: "none",
              cursor: "pointer",
              fontWeight: 500,
              background: "#ef4444",
              color: "white",
              transition: "0.2s"
            }}
            onMouseEnter={e => e.currentTarget.style.background = "#dc2626"}
            onMouseLeave={e => e.currentTarget.style.background = "#ef4444"}
          >
            🚪 Logout
          </button>
        </div>

        {/* BODY */}
        <div style={{ flex: 1, display: "flex" }}>

          <aside className="sidebar">
            <UploadFile onUploadSuccess={handleUploadSuccess} />

            <VersionHistory
              documentId={activeDoc?.documentId}
              onSelectDocument={safeSetActiveDoc}
              selectedVersionId={activeDoc?.versionId}
              refreshTrigger={refreshTrigger}
              onCompare={handleCompare}
              compareVersions={compareVersions}
              ref={versionRef}
            />
          </aside>

          <main className="main-content" style={{ position: "relative" }}>
            {console.log("APP → ACTIVE DOC:", activeDoc)}
            {compareMode && compareVersions && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "50px",
                  background: "rgba(15,23,42,0.95)",
                  backdropFilter: "blur(8px)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 16px",
                  zIndex: 20,
                  borderBottom: "1px solid rgba(255,255,255,0.1)"
                }}
              >
                <div style={{ fontSize: "14px", color: "#a5b4fc" }}>
                  Comparing Version {compareVersions.left.versionNumber} ↔ Version {compareVersions.right.versionNumber}
                </div>

                <button
                  onClick={() => {
                    setCompareMode(false);
                    setCompareVersions(null);
                  }}
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "13px"
                  }}
                >
                  Exit Compare
                </button>
              </div>
            )}
       

            {/*  COMPARE MODE */}
            {compareMode && compareVersions ? (
              <div style={{ display: "flex", gap: "10px", height: "100%",  paddingTop: "50px" }}>

                {/* LEFT */}
                <div style={{ flex: 1 }}>
                  <div style={{ padding: "6px", fontSize: "12px", color: "#a5b4fc" }}>
                    Version {compareVersions.left.versionNumber}
                  </div>
                  {compareVersions.left && (
                    <Editor
                      key={`left-${compareVersions.left.id}`}
                      documentId={compareVersions.left.documentId}
                      versionId={compareVersions.left.id}
                    />
                  )}
                </div>

                {/* RIGHT */}
                <div style={{ flex: 1 }}>
                  <div style={{ padding: "6px", fontSize: "12px", color: "#a5b4fc" }}>
                    Version {compareVersions.right.versionNumber}
                  </div>

                  {compareVersions.right && (
                    <Editor
                      key={`right-${compareVersions.right.id}`}
                      documentId={compareVersions.right.documentId}
                      versionId={compareVersions.right.id}
                    />
                  )}
                </div>

              </div>
            ) : (

              <Editor
                key={`${activeDoc?.documentId || "none"}-${activeDoc?.versionId || "latest"}`}
                documentId={activeDoc?.documentId}
                versionId={activeDoc?.versionId}
              />
            )}
          </main>

        </div>
      </div>
    </ModalProvider>
  );
}