import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App } from './js/App';
import { ChatView } from './js/ChatView';
import { DevPage } from './js/DevPage';
import { Home } from './js/Home';
import { ItemCreate } from './js/ItemCreate';
import { ItemView } from './js/ItemView';
import { NotFound } from './js/NotFound';
import { SampleChat } from './js/SampleChat';
import { Samples } from './js/Samples';
import { SampleVideo } from './js/SampleVideo';

ReactDOM
    .createRoot( document.getElementById('app') as Element )
    .render(
        <BrowserRouter>
        <Routes>
            <Route path='/' element={<App />} >
                <Route index element={<Home />} />
                <Route path='/chat/:uid' element={<ChatView />} />
                <Route path='/dev' element={<DevPage />} />
                <Route path='/item/create' element={<ItemCreate />} />
                <Route path='/item/view/:uid' element={<ItemView />} />
                <Route path='/samples' element={<Samples />} />
                <Route path='/samples/chat' element={<SampleChat />} />
                <Route path='/samples/video' element={<SampleVideo />} />
                <Route path='*' element={<NotFound />} />
            </Route>
        </Routes>
        </BrowserRouter>
    );
