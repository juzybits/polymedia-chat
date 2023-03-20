import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App } from './js/App';
import { ChatHome } from './js/ChatHome';
import { ChatMenu } from './js/ChatMenu';
import { ChatNew } from './js/ChatNew';
import { ChatView } from './js/ChatView';
import { NotFound } from './js/NotFound';

ReactDOM
    .createRoot( document.getElementById('app') as Element )
    .render(
        <BrowserRouter>
        <Routes>
            <Route path='/' element={<App />} >
                <Route index element={<ChatHome />} />
                <Route path='/new' element={<ChatNew />} />
                <Route path='/:uid' element={<ChatView />} />
                <Route path='/:uid/menu' element={<ChatMenu />} />

                <Route path='*' element={<NotFound />} />
            </Route>
        </Routes>
        </BrowserRouter>
    );
