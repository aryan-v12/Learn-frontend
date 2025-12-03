// import React from 'react';
// import { Navbar, Nav, Container, Button } from 'react-bootstrap';
// import { useNavigate, Link } from 'react-router-dom';
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';

// const CustomNavbar = () => {
//   const navigate = useNavigate();
//   const isLoggedIn = localStorage.getItem('token'); // Check kare ki user logged in hai kya
//   const role = localStorage.getItem('role'); // User ka role fetch kare

//   const handleLogout = () => {
//     console.log('Logout button clicked'); // Debugging ke liye
//     localStorage.removeItem('token');
//     localStorage.removeItem('role');
//     localStorage.removeItem('userId');
//     toast.success('Logged out successfully');
//     setTimeout(() => {
//       navigate('/');
//     }, 1000); // 1 second ke baad redirect karein
//   };

//   return (
//     <>
//       <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
//         <Container>
//           <Navbar.Brand as={Link} to="/">Learning Platform</Navbar.Brand>
//           <Navbar.Toggle aria-controls="basic-navbar-nav" />
//           <Navbar.Collapse id="basic-navbar-nav">
//             <Nav className="ms-auto">
//               <Nav.Link as={Link} to="/">Home</Nav.Link>
//               {/* Role-based Quizzes link */}
//               {role === 'admin' ? (
//                 <Nav.Link as={Link} to="/admin/topics">Quizzes</Nav.Link>
//               ) : (
//                 <Nav.Link as={Link} to="/quizzes">Quizzes</Nav.Link>
//               )}

//               {role === 'admin' ? (
//                 <Nav.Link as={Link} to="/admin/leaderboard">Leaderboard</Nav.Link>
//               ) : (
//                 <Nav.Link as={Link} to="/leaderboard">Leaderboard</Nav.Link>
//               )}

//               {role === 'admin' ? (
//                 <Nav.Link as={Link} to="/admin/discussion-forum">Discussion</Nav.Link>
//               ) : (
//                 <Nav.Link as={Link} to="/discussion-forum">Discussion</Nav.Link>
//               )}

//               {role === 'admin' ? (
//                 <Nav.Link as={Link} to="/admin/live-classes">Live Classes</Nav.Link>
//               ) : (
//                 <Nav.Link as={Link} to="/live-classes">Live Classes</Nav.Link>
//               )}

//               <Nav.Link as={Link} to="/chatbot">Chatbot</Nav.Link>
//               {isLoggedIn ? (
//                 <>
//                   {/* Role-based Dashboard link */}
//                   {role === 'admin' ? (
//                     <Nav.Link as={Link} to="/admin-dashboard">Dashboard</Nav.Link>
//                   ) : (
//                     <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
//                   )}
//                   <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
//                   <Button variant="danger" onClick={handleLogout}>Logout</Button>
//                 </>
//               ) : (
//                 <>
//                   <Nav.Link as={Link} to="/login">Login</Nav.Link>
//                   <Nav.Link as={Link} to="/signup">Signup</Nav.Link>
//                 </>
//               )}
//             </Nav>
//           </Navbar.Collapse>
//         </Container>
//       </Navbar>

//       {/* Add ToastContainer here */}
//       <ToastContainer
//         position="top-right"
//         autoClose={3000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         pauseOnHover
//       />
//     </>
//   );
// };

// export default CustomNavbar;
import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { useNavigate, Link, useLocation } from 'react-router-dom'; // Add useLocation
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const CustomNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Get current location
  const isLoggedIn = localStorage.getItem('token'); // Check if user is logged in
  const role = localStorage.getItem('role'); // Fetch user's role

  const handleLogout = () => {
    console.log('Logout button clicked'); // Debugging
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    toast.success('Logged out successfully');
    setTimeout(() => {
      navigate('/');
    }, 1000); // Redirect after 1 second
  };

  // Check if the current route is the Home Page
  const isHomePage = location.pathname === '/';

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg" sticky="top">
        <Container>
          <Navbar.Brand as={Link} to="/">Learning Platform</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/">Home</Nav.Link>
              {/* Role-based Quizzes link */}
              {role === 'admin' ? (
                <Nav.Link as={Link} to="/admin/topics">Quizzes</Nav.Link>
              ) : (
                <Nav.Link as={Link} to="/quizzes">Quizzes</Nav.Link>
              )}

              {role === 'admin' ? (
                <Nav.Link as={Link} to="/admin/leaderboard">Leaderboard</Nav.Link>
              ) : (
                <Nav.Link as={Link} to="/leaderboard">Leaderboard</Nav.Link>
              )}

              {role === 'admin' ? (
                <Nav.Link as={Link} to="/admin/discussion-forum">Discussion</Nav.Link>
              ) : (
                <Nav.Link as={Link} to="/discussion-forum">Discussion</Nav.Link>
              )}

              {role === 'admin' ? (
                <Nav.Link as={Link} to="/admin/live-classes">Live Classes</Nav.Link>
              ) : (
                <Nav.Link as={Link} to="/live-classes">Live Classes</Nav.Link>
              )}

              <Nav.Link as={Link} to="/chatbot">Chatbot</Nav.Link>
              {isLoggedIn ? (
                <>
                  {/* Role-based Dashboard link */}
                  {role === 'admin' ? (
                    <Nav.Link as={Link} to="/admin-dashboard">Dashboard</Nav.Link>
                  ) : (
                    <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
                  )}
                  <Nav.Link as={Link} to="/profile">Profile</Nav.Link>
                  {/* Hide Logout button on Home Page */}
                  {!isHomePage && (
                    <Button variant="danger" onClick={handleLogout}>Logout</Button>
                  )}
                </>
              ) : (
                <>
                  <Nav.Link as={Link} to="/login">Login</Nav.Link>
                  <Nav.Link as={Link} to="/signup">Signup</Nav.Link>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Add ToastContainer here */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default CustomNavbar;