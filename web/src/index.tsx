import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { App } from './js/App';
import { ChatMenu } from './js/ChatMenu';
import { ChatView } from './js/ChatView';
import { Home } from './js/Home';
import { NotFound } from './js/NotFound';
// import { DevPage } from './js/DevPage';
// import { ItemCreate } from './js/ItemCreate';
// import { ItemView } from './js/ItemView';
// import { Samples } from './js/Samples';
// import { SampleVideo } from './js/SampleVideo';

ReactDOM
    .createRoot( document.getElementById('app') as Element )
    .render(
        <BrowserRouter>
        <Routes>
            <Route path='/' element={<App />} >
                <Route index element={<Home />} />
                <Route path='/chat/:uid' element={<ChatView />} />
                <Route path='/chat/:uid/menu' element={<ChatMenu />} />
                <Route path='*' element={<NotFound />} />
{/*
                <Route path='/dev' element={<DevPage />} />
                <Route path='/item/create' element={<ItemCreate />} />
                <Route path='/item/view/:uid' element={<ItemView />} />
                <Route path='/samples' element={<Samples />} />
                <Route path='/samples/video' element={<SampleVideo />} />
*/}
            </Route>
        </Routes>
        </BrowserRouter>
    );
