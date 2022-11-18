import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';

export function Samples(props: any) {
    useEffect(() => {
        document.title = 'Polymedia - Samples';
    }, []);

    return <div id='page' className='page-tool'>
        <h1>Samples</h1>
        <div>
            <Link to='/samples/video'>VIDEO</Link><br/><br/>
            <Link to='/samples/chat'>CHAT</Link><br/><br/>
            {/*<Link to='/samples/ad'>AD</Link>*/}AD<br/><br/>
            {/*<Link to='/samples/audio'>AUDIO</Link>*/}AUDIO<br/><br/>
            {/*<Link to='/samples/chirp'>CHIRP</Link>*/}CHIRP<br/><br/>
            {/*<Link to='/samples/comment'>COMMENT</Link>*/}COMMENT<br/><br/>
            {/*<Link to='/samples/gallery'>GALLERY</Link>*/}GALLERY<br/><br/>
            {/*<Link to='/samples/image'>IMAGE</Link>*/}IMAGE<br/><br/>
            {/*<Link to='/samples/post'>POST</Link>*/}POST<br/><br/>
            {/*<Link to='/samples/resume'>RESUME</Link>*/}RESUME<br/><br/>
        </div>
    </div>;
}
