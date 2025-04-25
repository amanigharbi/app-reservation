import React, { useState } from 'react';
import {
  MDBModal, MDBModalDialog, MDBModalContent, MDBModalHeader,
  MDBModalTitle, MDBModalBody, MDBModalFooter, MDBInput, MDBBtn
} from 'mdb-react-ui-kit';

function PaymentModal({ show, onClose, amount, onSuccess }) {
  const [paymentMethod, setPaymentMethod] = useState('carte');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: ''
  });
  const [processing, setProcessing] = useState(false);

  const handlePayment = async () => {
    setProcessing(true);
    // Simulation de paiement
    setTimeout(() => {
      onSuccess({
        methode: paymentMethod,
        transactionId: 'tx_' + Math.random().toString(36).substr(2, 9)
      });
      setProcessing(false);
    }, 1500);
  };

  return (
    <MDBModal open={show} onClose={onClose}>
      <MDBModalDialog>
        <MDBModalContent>
          <MDBModalHeader>
            <MDBModalTitle>Paiement supplémentaire</MDBModalTitle>
          </MDBModalHeader>
          <MDBModalBody>
            <p className='h5 mb-4'>Montant à payer: {amount.toFixed(2)}€</p>
            
            <select
              className='form-select mb-3'
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
            >
              <option value='carte'>Carte de crédit</option>
              <option value='paypal'>PayPal</option>
              <option value='virement'>Virement bancaire</option>
            </select>

            {paymentMethod === 'carte' && (
              <>
                <MDBInput
                  label='Numéro de carte'
                  value={cardDetails.number}
                  onChange={e => setCardDetails({...cardDetails, number: e.target.value})}
                  className='mb-2'
                />
                <div className='d-flex'>
                  <MDBInput
                    label='Date expiration'
                    value={cardDetails.expiry}
                    onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})}
                    className='me-2'
                  />
                  <MDBInput
                    label='CVV'
                    value={cardDetails.cvv}
                    onChange={e => setCardDetails({...cardDetails, cvv: e.target.value})}
                  />
                </div>
              </>
            )}
          </MDBModalBody>
          <MDBModalFooter>
            <MDBBtn color='secondary' onClick={onClose}>
              Annuler
            </MDBBtn>
            <MDBBtn
              color='primary'
              onClick={handlePayment}
              disabled={processing || (paymentMethod === 'carte' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv))}
            >
              {processing ? 'Traitement...' : 'Payer'}
            </MDBBtn>
          </MDBModalFooter>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
}

export default PaymentModal;