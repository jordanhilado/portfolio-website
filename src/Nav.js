import React from 'react';
import './App.css';
// import { Button } from '@material-ui/core';
import { Link } from 'react-router-dom';

function Nav() {
    return (
        <div className="flex nav-bar">
            <Link to="/" className="nav-child">home</Link>
            <Link to="/about" className="nav-child">about</Link>
            <Link to="/projects" className="nav-child">projects</Link>
            <Link to="/experience" className="nav-child">experience</Link>
            <Link to="/contact" className="nav-child">contact</Link>
            <Link to="/blog" className="nav-child">blog</Link>
        </div>
    );
} 

export default Nav;
