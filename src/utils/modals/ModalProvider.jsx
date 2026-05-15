import { useState } from "react";
import ConfirmDialog from "./ConfirmDialog";
import { ModalContext } from "./ModalContext";

export function ModalProvider({ children }) {
    const [modal, setModal] = useState(null);

    const showConfirm = ({ title, message, onConfirm }) => {
        setModal({
            type: "confirm",
            title,
            message,
            onConfirm
        });
    };

    const closeModal = () => setModal(null);

    return (
        <ModalContext.Provider value={{ showConfirm }}>
            {children}

            {modal?.type === "confirm" && (
                <ConfirmDialog
                    isOpen={true}
                    title={modal.title}
                    message={modal.message}
                    onCancel={closeModal}
                    onConfirm={async () => {
                        try {
                            await modal.onConfirm?.(); 
                            closeModal();                
                        } catch (err) {
                            console.error("❌ Modal confirmation error:", err);
                        }
                    }}
                />
            )}
        </ModalContext.Provider>
    );
}
