import React from 'react';
import { Link } from 'react-router-dom';
// import './PageNotFound.css';
const PageNotFound: React.FC = () => {
    return (
        <div >
            <h1>404 - Page Not Found</h1>
            <p>Sorry, the page you are looking for does not exist.</p>
            <Link to="/">Go Back Home</Link>
        </div>
    );
};

export default PageNotFound;