// RefundModal.js
import React, { useState } from 'react';
import {
  MDBModal, MDBModalDialog, MDBModalContent, MDBModalHeader, MDBModalTitle,
  MDBModalBody, MDBModalFooter, MDBBtn, MDBInput
} from 'mdb-react-ui-kit';
import { useTranslation } from "react-i18next";

function RefundModal({ show, onClose, amount, onSuccess }) {
  const { t } = useTranslation();

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
            <MDBModalTitle>{t("rembou")}</MDBModalTitle>
          </MDBModalHeader>

          <MDBModalBody>
            <p>{t("mont_remb")}<strong>{amount.toFixed(2)} €</strong></p>
            <select
              className='form-select mb-3'
              value={method}
              onChange={e => setMethod(e.target.value)}
            >
              <option value='virement'>{t("vir")}</option>
              <option value='paypal'>{t("paypal")}</option>
              <option value='autre'>{t("other")}</option>
            </select>

            <MDBInput
              label={t("id_trans")}
              value={transactionId}
              onChange={e => setTransactionId(e.target.value)}
            />
          </MDBModalBody>

          <MDBModalFooter>
            <MDBBtn color='secondary' onClick={onClose} style={{textTransform : "none"}}>Annuler</MDBBtn>
            <MDBBtn color='success' onClick={handleRefund} disabled={processing} style={{textTransform : "none"}}>
              {processing ? t("trt") : t("remb_conf")}
            </MDBBtn>
          </MDBModalFooter>
        </MDBModalContent>
      </MDBModalDialog>
    </MDBModal>
  );
}

export default RefundModal;