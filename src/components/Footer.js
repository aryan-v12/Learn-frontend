import React from 'react';
import { Navbar, Container } from 'react-bootstrap';

const CustomFooter = () => {
  return (
    <Navbar bg="dark" variant="dark" fixed='bottom'>
      <Container style={{justifyContent:"center"}}>
        <Navbar.Text>© 2025 Learning Platform. All rights reserved.</Navbar.Text>
      </Container>
    </Navbar>
  );
};

export default CustomFooter;