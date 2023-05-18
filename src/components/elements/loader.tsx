import './loader.css';
import React from "react";
import Spinner from './oval.svg';

type LoaderProps = {
    visible: boolean;
    showIcon: boolean;
};

const Loader = ({visible, showIcon}: LoaderProps) =>
    <div className="loader" style={{'display': visible ? 'block' : 'none'}}>
        {showIcon && <img src={Spinner} alt="Spinner" className="loader-icon"/>}
    </div>;

export {Loader};
