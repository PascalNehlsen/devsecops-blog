// src/pages/index.js
import React from 'react';
import { Redirect } from 'react-router-dom';

const RedirectToIntro = () => {
    return <Redirect to="/devsecops-blog/docs/projects/intro" />;
};

export default RedirectToIntro;
