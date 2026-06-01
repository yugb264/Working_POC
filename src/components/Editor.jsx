import { useCallback, useEffect, useState, useRef } from "react";
import { DocumentEditor } from "@onlyoffice/document-editor-react";
import { FileText } from 'lucide-react';
import toast from "react-hot-toast";
import apiClient from "../service/apiclient";
import { ONLYOFFICE_DOCUMENT_SERVER_URL } from "../config/appConfig";
import { parseApiError } from "../utils/errorParser";

export default function Editor({ documentId, versionId, isReadOnly = false,isCompareMode = false}) {
  console.log("EDITOR RENDER:", {
    documentId,
    versionId,
    isReadOnly,
    
  });

  const [config, setConfig] = useState(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState(null);
  const [editorKey, setEditorKey] = useState(0);
  const editorKeyRef = useRef(0);
  const saveTriggeredRef = useRef(false);
  const [isSaving, setIsSaving] = useState(false);
  const editorDomId = isCompareMode
  ? `onlyoffice-editor-${versionId}`
  : "onlyoffice-editor";
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  const destroyEditor = useCallback(async() => {
    try {
      const id = editorDomId;
      console.log("🧨 destroyEditor CALLED");
      console.log("🧨 editorDomId:", id);
      console.log("🧨 instances BEFORE:", window.DocEditor?.instances);
      const editor = window.DocEditor?.instances?.[id];
  
      if (editor) {
        console.log("🧹 Fully destroying editor:", id);
  
        try {
          editor.destroyEditor?.();
          console.log("✅ destroyEditor() success");
          await sleep(700);
        } catch (e) {
          console.warn("destroyEditor failed", e);
        }
  
        // VERY IMPORTANT
        delete window.DocEditor.instances[id];
        console.log("🗑️ instance deleted");
      }
      else {
        console.log("⚠️ No existing editor found");
      }
      console.log("🧨 instances AFTER:", window.DocEditor?.instances);
      // ALSO CLEAR CONTAINER
      const container = document.getElementById(id);
  
      if (container) {
        container.innerHTML = "";
        console.log("🧼 container cleared");
      }
    } catch (e) {
      console.warn("Destroy failed", e);
    }
  }, [editorDomId]);

  useEffect(() => {
    const handleDocumentSaving = () => setIsSaving(true);
    const handleDocumentSaved = () => {
      setIsSaving(false);
      toast.success("Document saved successfully!");
    };

    window.addEventListener("documentSaving", handleDocumentSaving);
    window.addEventListener("documentSaved", handleDocumentSaved);

    return () => {
      window.removeEventListener("documentSaving", handleDocumentSaving);
      window.removeEventListener("documentSaved", handleDocumentSaved);
    };
  }, []);

  useEffect(() => {
    let timer;

    if (!documentId) {
      (async () => {
        await destroyEditor();
        setConfig(null);
      })();
    
      return;
    }

    const loadEditor = async () => {
     
     await destroyEditor();

      try {

        setIsSwitching(true);
        setError(null);

        let url;

        const cleanVersionId = versionId
          ? String(versionId).split("?")[0]
          : null;

        console.log("🔵 Normal API CALL");

        url = `/document/${documentId}/config`;

        if (cleanVersionId) {
          url += `?versionId=${cleanVersionId}`;
        }

        const res = await apiClient.get(url);
        const returnedConfig = { ...res.data };

        if (isReadOnly) {
          returnedConfig.editorConfig = {
            ...returnedConfig.editorConfig,
            mode: "view"
          };

          returnedConfig.document = {
            ...returnedConfig.document,
            permissions: {
              ...returnedConfig.document?.permissions,
              edit: false
            }
          };
        }

        returnedConfig.events = {
          onDocumentStateChange(event) {
            console.log("📡 State:", event.data);

            // When document becomes dirty
            if (event.data === true) {
              saveTriggeredRef.current = false;
            }

            // When document becomes clean (save finished)
            if (event.data === false && !saveTriggeredRef.current) {
              console.log("💾 Detected local forcesave trigger");
              saveTriggeredRef.current = true;
              // Now we wait for the backend SignalR 'DocumentSaving' event to show the loader!
            }
          },

          onError(e) {
            console.error("ONLYOFFICE ERROR", e);
       
          }
        };

        // ✅ small delay REQUIRED for OnlyOffice
        timer = setTimeout(() => {
          const nextEditorKey = `${documentId}-${versionId || "latest"}`;
          editorKeyRef.current = nextEditorKey;
          console.log("🚀 Creating NEW editor", {
            documentId,
            versionId,
            editorDomId
          });
          console.log("🔑 ONLYOFFICE KEY:", returnedConfig.document.key);
          console.log("📄 VERSION:", returnedConfig.document.title);
          console.log("📦 FULL CONFIG:", returnedConfig);
          setConfig(returnedConfig);
          setEditorKey(nextEditorKey);

          setTimeout(() => {
            setIsSwitching(false); // hide overlay AFTER mount
          }, 400);
        }, 1000);

      } catch (err) {
        console.error(err);
        const errorMsg = parseApiError(err, "Failed to load document config.");
        toast.error(errorMsg);
        setError(errorMsg);
      }
    };

    loadEditor();

    return () => {
      if (timer) clearTimeout(timer);
    
      (async () => {
        await destroyEditor();
      })();
    };
 

  }, [documentId, versionId, isReadOnly, destroyEditor]);


  const onDocumentReady = () => {
    console.log("✅ ONLYOFFICE READY");
  console.log("📦 Active instances:", window.DocEditor?.instances);
  };

  if (!documentId) {
    console.log("🚫 No documentId → clearing editor");
    return (
      <div className="glass-panel" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        <FileText size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
        <h2>No Document Selected</h2>
        <p style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Upload or select a document to start collaborating</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass-panel" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fca5a5' }}>
        {error}
      </div>
    );
  }

  return (
    <div
 
      style={{
        height: "100%",
        position: "relative",
        transition: "opacity 0.35s ease",
        opacity: isSwitching ? 0.4 : 1,
   
      }}
    >

      {/* 💾 SAVING LOADER OVERLAY - Blocks Edit during save */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15,23,42,0.3)',
          backdropFilter: 'blur(2px)',
          display: isSaving ? 'flex' : 'none',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 15,
          pointerEvents: 'auto', // BLOCK editing
          color: '#fff'
        }}
      >
        <div style={{
          background: 'rgba(15,23,42,0.85)',
          padding: '20px 40px',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ width: 24, height: 24, border: '3px solid rgba(255,255,255,0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
          <div style={{ fontWeight: 500, fontSize: '15px' }}>Saving Document...</div>
          <style>
            {`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}
          </style>
        </div>
      </div>

      {/* 🧠 KEEP editor ALWAYS mounted once loaded */}
      {config && (
        <DocumentEditor
          key={editorKey}
          id={editorDomId}
          documentServerUrl={ONLYOFFICE_DOCUMENT_SERVER_URL}
          config={config}
          events_onDocumentReady={onDocumentReady}
          height="100%"
        />
      )}

      {/* 🔄 SMOOTH OVERLAY */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(6px)',
          display: (!config || isSwitching) ? 'flex' : 'none',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
          pointerEvents: isSwitching ? "auto" : "none",
          opacity: (!config || isSwitching) ? 1 : 0,
          transition: 'opacity 0.35s ease'
        }}
      >
        <div
          style={{ width: "80%", maxWidth: 800 }}
        />
        <div className="skeleton skeleton-title" />

        {/* Paragraph lines */}
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line short" />

        <div style={{ height: 20 }} />

        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line" />
        <div className="skeleton skeleton-line short" />

      </div>

    </div>
  );
}
