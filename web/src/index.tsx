import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App } from './js/App';
import { Home } from './js/Home';
import { NotFound } from './js/NotFound';
import { VideoExample } from './js/VideoExample';

ReactDOM
    .createRoot( document.getElementById('app') )
    .render(
        <BrowserRouter>
        <Routes>
            <Route path='/' element={<App />} >
                <Route index element={<Home />} />
                <Route path='/video-example' element={<VideoExample />} />
                <Route path='*' element={<NotFound />} />
            </Route>
        </Routes>
        </BrowserRouter>
    );
