import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, matchPath } from "react-router-dom";
import UploadFile from "./components/UploadFile";
import VersionHistory from "./components/VersionHistory";
import Editor from "./components/Editor";
import { useMsal } from "@azure/msal-react";
import { ModalProvider } from "./utils/modals/ModalProvider";
import { startConnection, getConnection } from "./service/signalrService";

export default function ProtectedApp() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const { instance } = useMsal();
  const versionRef = useRef();
  
  const navigate = useNavigate();
  const location = useLocation();

  // Redirect to home if the user hits the browser reload button
  useEffect(() => {
    const navEntries = performance.getEntriesByType("navigation");
    if (navEntries.length > 0 && navEntries[0].type === "reload") {
      if (location.pathname !== "/") {
        navigate("/", { replace: true });
      }
    }
  }, [navigate, location.pathname]);

  // --- Router-driven State ---
  const docMatch = matchPath("/document/:documentId", location.pathname);
  const docVerMatch = matchPath("/document/:documentId/version/:versionId", location.pathname);
  const compMatch = matchPath("/compare/:documentId/:leftVersionId/:rightVersionId", location.pathname);

  let activeDocId = null;
  let activeVersionId = null;
  let isCompareMode = false;
  let compareLeftId = null;
  let compareRightId = null;

  if (compMatch) {
    activeDocId = Number(compMatch.params.documentId);
    isCompareMode = true;
    compareLeftId = Number(compMatch.params.leftVersionId);
    compareRightId = Number(compMatch.params.rightVersionId);
  } else if (docVerMatch) {
    activeDocId = Number(docVerMatch.params.documentId);
    activeVersionId = Number(docVerMatch.params.versionId);
  } else if (docMatch) {
    activeDocId = Number(docMatch.params.documentId);
  }

  // Read full version objects from router state if available (for displaying version numbers)
  const compareState = location.state;

  const handleLogout = () => {
    instance.logoutRedirect();
  };

  const handleUploadSuccess = (doc) => {
    console.log("📤 Upload success:", doc);
    navigate(`/document/${doc.documentId ?? doc.id}`);
    
    setTimeout(() => {
      setRefreshTrigger(prev => prev + 1);
    }, 100);
  };

  const handleCompare = (v1, v2) => {
    console.log("⚖️ Compare mode ON", v1, v2);
    navigate(`/compare/${v1.documentId}/${v1.id}/${v2.id}`, {
      state: { left: v1, right: v2 }
    });
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

    if (!conn || !activeDocId) return;

    const docIdStr = activeDocId.toString();

    if (conn.state !== "Connected") {
      console.log("⏳ Waiting for SignalR connection...");
      return;
    }

    console.log("📡 Joining SignalR group:", docIdStr);
    conn.invoke("JoinDocumentGroup", docIdStr);

    conn.on("DocumentUpdated", async (data) => {
      console.log("🔥 Real-time update received:", data);

      if (data.documentId === activeDocId) {
        const refreshResult = await versionRef.current?.refreshVersions?.();

        if (refreshResult?.hasNewVersion && !isCompareMode) {
          console.log("🚀 Switching to latest version");
          const latestVersionId =
            refreshResult.latestVersionId ??
            await versionRef.current?.getLatestVersionId?.();
          
          navigate(`/document/${data.documentId}/version/${latestVersionId}`);
        }
      }
    });

    return () => {
      console.log("🚪 Leaving group:", docIdStr);
      conn.invoke("LeaveDocumentGroup", docIdStr);
      conn.off("DocumentUpdated");
    };
  }, [activeDocId, isCompareMode, navigate]);

  return (
    <ModalProvider>
      <div style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
        
        {/* HEADER */}
        <div style={{ height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 style={{ margin: 0 }}>📄 MyOffice Docs</h2>
          <button onClick={handleLogout} style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px 14px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: 500, background: "#ef4444", color: "white", transition: "0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#dc2626"} onMouseLeave={e => e.currentTarget.style.background = "#ef4444"}>
            🚪 Logout
          </button>
        </div>

        {/* BODY */}
        <div style={{ flex: 1, display: "flex" }}>
          
          <aside className="sidebar">
            <UploadFile onUploadSuccess={handleUploadSuccess} />
            <VersionHistory
              documentId={activeDocId}
              selectedVersionId={activeVersionId}
              refreshTrigger={refreshTrigger}
              onCompare={handleCompare}
              compareVersions={isCompareMode ? { left: { id: compareLeftId }, right: { id: compareRightId } } : null}
              ref={versionRef}
            />
          </aside>

          <main className="main-content" style={{ position: "relative" }}>
            {isCompareMode && (
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50px", background: "rgba(15,23,42,0.95)", backdropFilter: "blur(8px)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", zIndex: 20, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ fontSize: "14px", color: "#a5b4fc" }}>
                  Comparing Version {compareState?.left?.versionNumber || '?'} ↔ Version {compareState?.right?.versionNumber || '?'}
                </div>
                <button onClick={() => navigate(`/document/${activeDocId}`)} style={{ background: "#ef4444", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "13px" }}>
                  Exit Compare
                </button>
              </div>
            )}
       
            {/*  COMPARE MODE */}
            {isCompareMode ? (
              <div style={{ display: "flex", gap: "10px", height: "100%",  paddingTop: "50px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ padding: "6px", fontSize: "12px", color: "#a5b4fc" }}>
                    Version {compareState?.left?.versionNumber || '?'}
                  </div>
                  <Editor key={`left-${compareLeftId}`} documentId={activeDocId} versionId={compareLeftId} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ padding: "6px", fontSize: "12px", color: "#a5b4fc" }}>
                    Version {compareState?.right?.versionNumber || '?'}
                  </div>
                  <Editor key={`right-${compareRightId}`} documentId={activeDocId} versionId={compareRightId} />
                </div>
              </div>
            ) : (
              <Editor
                key={`${activeDocId || "none"}-${activeVersionId || "latest"}`}
                documentId={activeDocId}
                versionId={activeVersionId}
              />
            )}
          </main>

        </div>
      </div>
    </ModalProvider>
  );
}