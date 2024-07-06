import React from 'react';
import {
  Navbar,
  NavbarBrand,
} from 'reactstrap';

export const NavigationBar: React.FC = () => {
  return (
    <Navbar color="light" light expand="md" fixed="top">
      <NavbarBrand href={'./'}>
        CodinGame Ranking Replay
      </NavbarBrand>
    </Navbar>
  );
};