// documentService.ts

import axios, { AxiosInstance } from "axios";
import { API_BASE_URL } from "../config/appConfig";

// ============================
// AXIOS INSTANCE
// ============================

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Optional: Add interceptors later (auth, logging, etc.)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error);
    return Promise.reject(error);
  }
);

// ============================
// TYPES
// ============================

export interface DocumentResponse {
  id: number;
  fileName: string;
  filePath: string;
  fileHash: string;
  contentType: string;
  fileSize: number;
  createdAt: string;
}

export interface DocumentListItem {
  id: number;
  fileName: string;
  fileSize: number;
}

export interface DocumentVersion {
  id: number;
  documentId: number;
  versionNumber: number;
  filePath: string;
  fileHash: string;
  modifiedBy: string;
  modifiedAt: string;
}

// ============================
// SERVICE CLASS
// ============================

class DocumentService {
  // ---------------- UPLOAD ----------------
  async upload(file: File): Promise<DocumentResponse> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post("/document/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  // ---------------- GET ALL DOCUMENTS ----------------
  async getAll(): Promise<DocumentListItem[]> {
    const response = await api.get("/document");
    return response.data;
  }

  // ---------------- GET VERSIONS ----------------
  async getVersions(documentId: number): Promise<DocumentVersion[]> {
    const response = await api.get(`/document/${documentId}/versions`);
    return response.data;
  }

  // ---------------- GET DOCUMENT CONFIG (ONLYOFFICE) ----------------
  async getConfig(documentId: number): Promise<any> {
    const response = await api.get(`/document/${documentId}/config`);
    return response.data;
  }

  // ---------------- DOWNLOAD FILE ----------------
  async download(filename: string): Promise<Blob> {
    const response = await api.get(`/document/files/${filename}`, {
      responseType: "blob",
    });

    return response.data;
  }

  // ---------------- GET DOWNLOAD URL (helper) ----------------
  getFileUrl(filename: string): string {
    return `${API_BASE_URL}/document/files/${filename}`;
  }
}

// ============================
// EXPORT SINGLETON
// ============================

const documentService = new DocumentService();
export default documentService;