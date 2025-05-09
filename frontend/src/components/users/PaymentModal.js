import React, { useState } from 'react';
import {
  MDBModal, MDBModalDialog, MDBModalContent, MDBModalHeader,
  MDBModalTitle, MDBModalBody, MDBModalFooter, MDBInput, MDBBtn
} from 'mdb-react-ui-kit';
import { useTranslation } from "react-i18next";

function PaymentModal({ show, onClose, amount, onSuccess }) {
  const { t } = useTranslation();

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
            <MDBModalTitle>{t("supp_paiment")}</MDBModalTitle>
          </MDBModalHeader>
          <MDBModalBody>
            <p className='h5 mb-4'>{t("amount_paid")} {amount.toFixed(2)}€</p>
            
            <select
              className='form-select mb-3'
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
            >
              <option value='carte'>{t("credit")}</option>
              <option value='paypal'>{t("paypal")}</option>
              <option value='virement'>{t("vir")}</option>
            </select>

            {paymentMethod === 'carte' && (
              <>
                <MDBInput
                  label={t("number_card")}
                  value={cardDetails.number}
                  onChange={e => setCardDetails({...cardDetails, number: e.target.value})}
                  className='mb-2'
                />
                <div className='d-flex'>
                  <MDBInput
                    label={t("exp_date")}
                    value={cardDetails.expiry}
                    onChange={e => setCardDetails({...cardDetails, expiry: e.target.value})}
                    className='me-2'
                  />
                  <MDBInput
                    label={t("cvv")}
                    value={cardDetails.cvv}
                    onChange={e => setCardDetails({...cardDetails, cvv: e.target.value})}
                  />
                </div>
              </>
            )}
          </MDBModalBody>
          <MDBModalFooter>
            <MDBBtn color='secondary' onClick={onClose}>
              {t("cancel")}
            </MDBBtn>
            <MDBBtn
              color='primary'
              onClick={handlePayment}
              disabled={processing || (paymentMethod === 'carte' && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv))}
            >
              {processing ? t("trt") : t("pai")}
            </MDBBtn>
          </MDBModalFooter>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
}

export default PaymentModal;