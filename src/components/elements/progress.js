import { h } from 'preact';
import style from './progress.css';

function Progress (props) {
    
    return(<div class={style.progress} >
        <div class={style.progressdone} style={{width: `${props.progress}%`} } />
    </div>);    
}

export default Progress;
