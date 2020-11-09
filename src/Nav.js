import React from 'react';
import './App.css';
// import { Button } from '@material-ui/core';
import { Link } from 'react-router-dom';

function Nav() {
    return (
        <div>
            <Link to="/about" className="flex-nav">about</Link>
            <Link to="/projects" className="flex-nav">projects</Link>
            <Link to="/experience" className="flex-nav">experience</Link>
            <Link to="/contact" className="flex-nav">contact</Link>
            <Link to="/blog" className="flex-nav">blog</Link>
        </div>
    );
} 

export default Nav;
