import styles from './Modal.module.css' 

const Modal = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
  
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          {children}
          <button onClick={onClose} className={styles.modalCloseButton}>
            &times;
          </button>
        </div>
      </div>
    );
  };
  

  export default Modal;