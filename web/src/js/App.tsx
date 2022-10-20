import React from 'react';
import { Outlet } from 'react-router-dom';

export function App(props)
{
    return <Outlet context={[]} />
}
