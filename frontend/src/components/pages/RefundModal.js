// RefundModal.js
import React, { useState } from 'react';
import {
  MDBModal, MDBModalDialog, MDBModalContent, MDBModalHeader, MDBModalTitle,
  MDBModalBody, MDBModalFooter, MDBBtn, MDBInput
} from 'mdb-react-ui-kit';

function RefundModal({ show, onClose, amount, onSuccess }) {
  const [processing, setProcessing] = useState(false);
  const [method, setMethod] = useState('virement');
  const [transactionId, setTransactionId] = useState('');

  const handleRefund = () => {
    setProcessing(true);
    setTimeout(() => {
      onSuccess({
        methode: method,
        transactionId: transactionId || 'REFUND-' + Math.floor(Math.random() * 1000000),
      });
    }, 1000);
  };

  return (
    <MDBModal open={show} tabIndex='-1' onClose={onClose} staticBackdrop>
      <MDBModalDialog>
        <MDBModalContent>
          <MDBModalHeader>
            <MDBModalTitle>Remboursement</MDBModalTitle>
          </MDBModalHeader>

          <MDBModalBody>
            <p>Montant à rembourser : <strong>{amount.toFixed(2)} €</strong></p>
            <select
              className='form-select mb-3'
              value={method}
              onChange={e => setMethod(e.target.value)}
            >
              <option value='virement'>Virement bancaire</option>
              <option value='paypal'>PayPal</option>
              <option value='autre'>Autre</option>
            </select>

            <MDBInput
              label='ID de transaction (optionnel)'
              value={transactionId}
              onChange={e => setTransactionId(e.target.value)}
            />
          </MDBModalBody>

          <MDBModalFooter>
            <MDBBtn color='secondary' onClick={onClose}>Annuler</MDBBtn>
            <MDBBtn color='success' onClick={handleRefund} disabled={processing}>
              {processing ? 'Traitement...' : 'Confirmer le remboursement'}
            </MDBBtn>
          </MDBModalFooter>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
}

export default RefundModal;