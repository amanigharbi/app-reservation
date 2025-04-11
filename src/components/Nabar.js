import React from 'react';
import { Link } from 'react-router-dom';
import { MDBNavbar, MDBNavbarBrand, MDBNavbarNav, MDBNavbarItem, MDBNavbarLink } from 'mdb-react-ui-kit'; // Correction ici

function Navbar() {
  return (
    <MDBNavbar expand="lg" className="bg-primary">
      <MDBNavbarBrand>
        <Link to="/" className="text-white">Logo</Link>
      </MDBNavbarBrand>
      <MDBNavbarNav>
        <MDBNavbarItem> {/* Changement de MDBNavItem à MDBNavbarItem */}
          <MDBNavbarLink to="/dashboard" className="text-white">Dashboard</MDBNavbarLink>
        </MDBNavbarItem>
        <MDBNavbarItem>
          <MDBNavbarLink to="/mes-reservations" className="text-white">Mes Réservations</MDBNavbarLink>
        </MDBNavbarItem>
        <MDBNavbarItem>
          <MDBNavbarLink to="/reserver" className="text-white">Réserver</MDBNavbarLink>
        </MDBNavbarItem>
        <MDBNavbarItem>
          <MDBNavbarLink to="/profil" className="text-white">Profil</MDBNavbarLink>
        </MDBNavbarItem>
      </MDBNavbarNav>
    </MDBNavbar>
  );
}

export default Navbar;
