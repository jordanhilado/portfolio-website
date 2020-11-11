import React from 'react';
import './App.css';
import About from './components/About';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Contact from './components/Contact';
import Blog from './components/Blog';
import Nav from './Nav';
import Typical from 'react-typical'
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { Link } from 'react-router-dom';

function App() {
  return (
    <Router>
      <div className="App">
        {/* <Link to="/" style={{ textDecoration: 'none' }}><h1 className="flex name">Jordan Ali Hilado</h1></Link> */}
        <Nav />
        <Switch>
          <Route path="/" exact component={Home} />
          <Route path="/about" component={About} />
          <Route path="/projects" component={Projects} />
          <Route path="/experience" component={Experience} />
          <Route path="/contact" component={Contact} />
          <Route path="/blog" component={Blog} />
        </Switch>
      </div>
    </Router>
  );
} 

const Home = () => (
  <div>
    <h1 className="flex content">homepage</h1>
    <p className="flex moving-text">
      I'm a {' '}
      <Typical
      loop={Infinity}
      steps={['Student 📚', 1500,
            'Developer 👨‍💻', 1500,
            'Laker Fan 🏀', 1500,
            'Open Sourcer 🛠', 1500,
            'Hydro Homie 🚰', 1500,
            'Learner 📝', 1500]}
      wrapper="b"
      />
    </p>
  </div>
)

export default App;
