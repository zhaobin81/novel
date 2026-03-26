import { Navbar as BSNavbar, Container, Nav } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';

export default function Navigation() {
  const location = useLocation();

  return (
    <BSNavbar bg="dark" variant="dark" expand="lg" sticky="top">
      <Container>
        <BSNavbar.Brand as={Link} to="/">
          小说智能体
        </BSNavbar.Brand>
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link
              as={Link}
              to="/"
              active={location.pathname === '/'}
            >
              欢迎
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/settings"
              active={location.pathname === '/settings'}
            >
              API设置
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/world-builder"
              active={location.pathname === '/world-builder'}
            >
              世界观
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/character-designer"
              active={location.pathname === '/character-designer'}
            >
              角色
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/outline-planner"
              active={location.pathname === '/outline-planner'}
            >
              大纲
            </Nav.Link>
            <Nav.Link
              as={Link}
              to="/writer"
              active={location.pathname === '/writer'}
            >
              写作
            </Nav.Link>
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
}
