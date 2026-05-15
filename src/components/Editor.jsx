import React, { useEffect, useState } from "react";
import axios from "axios";
import { DocumentEditor } from "@onlyoffice/document-editor-react";
import { FileText } from 'lucide-react';
import { useAuthToken } from "../service/authService";
import { useRef } from "react";
// import { API_BASE_URL } from "../config/apiconfig";
import apiClient from "../service/apiclient";
import { ONLYOFFICE_DOCUMENT_SERVER_URL } from "../config/appConfig";

export default function Editor({ documentId, versionId }) {
  console.log("EDITOR RENDER:", {
    documentId,
    versionId
  });

  // const { getToken } = useAuthToken();
  const [config, setConfig] = useState(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [error, setError] = useState(null);
  const [editorKey, setEditorKey] = useState(0);
  const saveTimeoutRef = useRef(null);
  const isUserSavingRef = useRef(false);
  const manualSaveRef = useRef(false);
  let lastSaveTimeRef = useRef(0);
  const wasDirtyRef = useRef(false);
  let saveTriggeredRef = useRef(false);
  const editStartTimeRef = useRef(null);
  const destroyEditor = () => {
    try {
      const id = `docxEditor_${documentId}_${editorKey}`;
      const editor = window.DocEditor?.instances?.[id];

      if (editor && editor.destroyEditor) {
        editor.destroyEditor();
      }
    } catch (e) {
      console.warn("Destroy failed", e);
    }
  };
  useEffect(() => {

    if (!documentId) {
      destroyEditor();
      setConfig(null);
      return;
    }

    const loadEditor = async () => {


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

        // const token = await getToken();

        const res = await apiClient.get(url);
        const returnedConfig = { ...res.data };

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
        let timer;

        timer = setTimeout(() => {
          setConfig(returnedConfig);
          setEditorKey(Date.now());

          setTimeout(() => {
            setIsSwitching(false); // hide overlay AFTER mount
          }, 400);
        }, 200);

        return () => clearTimeout(timer);

      } catch (err) {
        console.error(err);
        toast.error("Failed to load document");
        setError("Failed to load document config.");
      }
    };

    loadEditor();



  }, [documentId, versionId]);


  const onDocumentReady = () => {
    console.log("✅ ONLYOFFICE Document Ready");
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
        opacity: isSwitching ? 0.4 : 1
      }}
    >

      {/* 🧠 KEEP editor ALWAYS mounted once loaded */}
      {config && (
        <DocumentEditor
          key={editorKey}
          id={`docxEditor_${documentId}_${versionId || "latest"}_${editorKey}`}
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
