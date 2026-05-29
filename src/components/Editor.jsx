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
  const editorDomId = isCompareMode
  ? `onlyoffice-editor-${versionId}`
  : "onlyoffice-editor";

  const destroyEditor = useCallback(() => {
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
    let timer;

    if (!documentId) {
      destroyEditor();
      setConfig(null);
      return;
    }

    const loadEditor = async () => {
     
      destroyEditor();

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
              console.log("💾 Detected real save");

              saveTriggeredRef.current = true;

              setTimeout(() => {
                console.log("🚀 Triggering onSave");


              }, 2000); // wait for backend
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
        }, 200);

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
      destroyEditor();
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
        transition: "opacity 0.35s ease",
        opacity: isSwitching ? 0.4 : 1,
   
      }}
    >

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
      {(!config || isSwitching) && (
        <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'rgba(15,23,42,0.6)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
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
      )}

    </div>
  );
}
