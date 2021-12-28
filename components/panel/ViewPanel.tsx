import type { NextPage } from 'next'
import { useState, useContext, useEffect } from 'react'

import {SocketContext} from '../../shared/context/socket';

import { useSelector } from 'react-redux'
import { useRematchDispatch } from '../../shared/utils'

export const ViewPanel: NextPage = () => {
    const [viewers, setViewers] = useState([]);

    const { self, opponent } = useSelector((state: any) => ({
        self: state.account.address,
        opponent: state.account.opponent,
    }))

    const { setPlayerStatus } = useRematchDispatch((dispatch: any) => ({
        setPlayerStatus: dispatch.account.setStatus,
    }))

    const socket = useContext(SocketContext);

    useEffect(() => {
        socket.once("as_view", (viewers: string[]) => {
            console.log("joined viewer", viewers)
            setViewers(viewers)
        })
    })

    return (
        <>
            <div className='border-2 rounded-lg h-32'>
                <p className='text-3xl pl-3 border-2 rounded-lg'>Players</p>
                <p className='text-2xl pl-3'>{ self }</p>
                <p className='text-2xl pl-3'>{ opponent }</p>
            </div>
            <div className='border-2 rounded-lg h-64'>
                <p className='text-3xl pl-3 border-2 rounded-lg'>Viewers</p>
                { viewers.map((value, key) => {
                    return (
                        <p key={ key } className='text-2xl pl-3'>{ value }</p>
                    )
                }) }
            </div>
        </>
    )
}
