import React from 'react';
import {
  BrowserRouter, Route, Routes, Navigate
} from 'react-router-dom';
import { Container } from 'reactstrap';
import { NavigationBar } from './components/NavigationBar';
import { ChartPage } from './pages/chart';

const App: React.FC = () => {
  return (
    <div className="App">
      <NavigationBar />
      <BrowserRouter>
        <Container style={{ width: '100%', maxWidth: '90%', marginTop: '80px' }}>
          <Routes>
            <Route
              path="/chart/:contest/:pseudo"
              element={<ChartPage />}
            />
            <Route
              path="/chart/:contest/"
              element={<ChartPage />}
            />
            <Route path="/" element={<ChartPage />} />
            <Route path="/chart/" element={<Navigate replace to="/" />} />
          </Routes>
        </Container>
      </BrowserRouter>
      <footer
        className="footer"
        style={{
          marginTop: '30px',
          padding: '30px',
          backgroundColor: '#efefef',
        }}
      >
        <div className="container">
          連絡先:{' '}
          <a
            href="https://twitter.com/iiljj"
            target="_blank"
            rel="noreferrer noopener"
          >
            si (@iiljj) / Twitter(X)
          </a>
          {', '}
          <a
            href="https://github.com/iilj"
            target="_blank"
            rel="noreferrer noopener"
          >
            iilj (iilj) / GitHub
          </a>
        </div>
      </footer>
    </div>
  );
}

export default App;
