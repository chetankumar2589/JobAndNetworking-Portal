import React, { Component } from 'react';
import './index.css';

class Modal extends Component {
  render() {
    const { onClose, message } = this.props;
    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <button onClick={onClose} className="modal-close-button">
            &times;
          </button>
          <p className="modal-message">{message}</p>
          <button onClick={onClose} className="modal-ok-button">
            OK
          </button>
        </div>
      </div>
    );
  }
}

export default Modal;
