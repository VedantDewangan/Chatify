import React from 'react'
import {Outlet, Navigate} from "react-router-dom"
import { useAuth } from '../context/AuthContext'

export const VerifyUsers = ()=>{
    const {authUser} = useAuth();
    return authUser? <Navigate to={"/login"} /> : <Outlet />;
}