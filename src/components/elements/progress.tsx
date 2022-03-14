import './progress.css';
import React from "react";

type ProgressProps = {
    progress: number;
};

const Progress = ({progress}: ProgressProps) =>
    <div className="progress">
        <div className="progressdone" style={{width: `${progress}%`}}/>
    </div>;

export default Progress;