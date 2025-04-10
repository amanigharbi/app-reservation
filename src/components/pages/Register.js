import React, { useState } from 'react';
import { MDBContainer, MDBRow, MDBCol, MDBBtn, MDBIcon, MDBInput } from 'mdb-react-ui-kit';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../firebase';
import '../styles/Pages.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import { useNavigate } from 'react-router-dom';
import logo from '../../images/logo.png';

function Register() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      console.log('Utilisateur inscrit avec succès');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      setError("Erreur lors de la création du compte. L'email est peut-être déjà utilisé.");
    }
  };

  return (
    <MDBContainer fluid className="p-12 my-5 h-custom">
      <MDBRow>
        <MDBCol col='10' md='6'>
          <img
            src="https://plus.unsplash.com/premium_photo-1663076518116-0f0637626edf?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            className="img-fluid"
            alt="Illustration d'inscription"
          />
        </MDBCol>

        <MDBCol col='4' md='6'>
        <div className="d-flex flex-row align-items-center justify-content-center">
            <img src={logo} alt="ReserGo Logo" className="img-fluid" style={{ maxWidth: '200px' , maxHeight :'150px' ,marginTop:'-15%'}} />
          </div>
          <div className="d-flex flex-row align-items-center justify-content-center">
            <p className="lead fw-normal mb-0 me-3">S'inscrire avec</p>

            <MDBBtn floating size='md' tag='a' className='me-2'>
              <MDBIcon fab icon='facebook-f' />
            </MDBBtn>
            <MDBBtn floating size='md' tag='a' className='me-2'>
              <MDBIcon fab icon='twitter' />
            </MDBBtn>
            <MDBBtn floating size='md' tag='a' className='me-2'>
              <MDBIcon fab icon='linkedin-in' />
            </MDBBtn>
          </div>

          <div className="divider d-flex align-items-center my-4">
            <p className="text-center fw-bold mx-3 mb-0">Ou</p>
          </div>

          {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

          {/* Prénom & Nom */}
          <MDBRow className="mb-4">
            <MDBCol md="6">
              <MDBInput
                label='Prénom'
                id='firstName'
                type='text'
                size="lg"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </MDBCol>
            <MDBCol md="6">
              <MDBInput
                label='Nom'
                id='lastName'
                type='text'
                size="lg"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </MDBCol>
          </MDBRow>

          {/* Nom d'utilisateur */}
          <MDBInput
            wrapperClass='mb-4'
            label="Nom d'utilisateur"
            id='username'
            type='text'
            size="lg"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          {/* Email */}
          <MDBInput
            wrapperClass='mb-4'
            label='Adresse e-mail'
            id='email'
            type='email'
            size="lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          {/* Mot de passe & Confirmation */}
          <MDBRow className="mb-4">
            <MDBCol md="6">
              <MDBInput
                label='Mot de passe'
                id='password'
                type='password'
                size="lg"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </MDBCol>
            <MDBCol md="6">
              <MDBInput
                label='Confirmer le mot de passe'
                id='confirmPassword'
                type='password'
                size="lg"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </MDBCol>
          </MDBRow>

          <div className='text-center text-md-center mt-4 pt-2'>
            <MDBBtn className="mb-0 px-5" size='lg' onClick={handleRegister} style={{ textTransform: 'none' }}>S'inscrire</MDBBtn>
            <p className="small fw-bold mt-2 pt-1 mb-2">
              Vous avez déjà un compte ? <a href="/" className="link-danger">Se connecter</a>
            </p>
          </div>
        </MDBCol>
      </MDBRow>

      <footer className="footer">
        <div className="d-flex flex-column flex-md-row text-center text-md-start justify-content-between py-4 px-4 px-xl-5 bg-primary">
          <div className="text-white mb-3 mb-md-0">
            Copyright © 2025. Tous droits réservés.
          </div>

          <div>
            <MDBBtn tag='a' color='none' className='mx-3' style={{ color: 'white' }}>
              <MDBIcon fab icon='facebook-f' size="md" />
            </MDBBtn>
            <MDBBtn tag='a' color='none' className='mx-3' style={{ color: 'white' }}>
              <MDBIcon fab icon='twitter' size="md" />
            </MDBBtn>
            <MDBBtn tag='a' color='none' className='mx-3' style={{ color: 'white' }}>
              <MDBIcon fab icon='google' size="md" />
            </MDBBtn>
            <MDBBtn tag='a' color='none' className='mx-3' style={{ color: 'white' }}>
              <MDBIcon fab icon='linkedin-in' size="md" />
            </MDBBtn>
          </div>
        </div>
      </footer>
    </MDBContainer>
  );
}

export default Register;
