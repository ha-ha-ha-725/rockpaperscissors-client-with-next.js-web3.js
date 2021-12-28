import React, { useState, useEffect, useContext } from 'react'
import type { GetServerSideProps, NextPage } from 'next'
import { useRouter } from 'next/router'
// import { io } from "socket.io-client";
import {SocketContext} from '../../shared/context/socket';

import { useWeb3React } from "@web3-react/core"
import { injected } from "../../components/wallet/Connectors"

import { useSelector } from 'react-redux'
import { useRematchDispatch } from '../../shared/utils'

import Rock from '../Rock'
import Paper from '../Paper'
import Scissors from '../Scissors'

import { HeaderPanel } from "../../components/panel/HeaderPanel";
import { GamePanel } from "../../components/panel/GamePanel";
import { ViewPanel } from "../../components/panel/ViewPanel";
import { PlayerStatus } from '../../shared/models/account';
import { GameStatus } from '../../shared/models/game';
import { RoundStatus } from '../../shared/models/round';

const Viewer: NextPage = () => {
    const socket = useContext(SocketContext);

    const { address } = useSelector((state: any) => ({
        address: state.account.address,
    }))

    const [roundNo, setRoundNo] = useState(0);
    const [roundCount, setRoundCount] = useState(0);
    const [player1, setPlayer1] = useState({});
    const [player2, setPlayer2] = useState({});
    const [viewers, setViewers] = useState([]);

    // const [isGameOver, setGameOver] = useState(false)

    const nextRound: Function = () => {
        return setTimeout(() => {
            console.log("===========")
            // setGameStatus(GameStatus.WaitingPick)
            // setRoundStatus(RoundStatus.None)
            // setPlayerStatus(PlayerStatus.Piking)
        }, 3000)
    }
    // const { active, account, library, connector, activate, deactivate } = useWeb3React()
    // const router = useRouter()
    // const roomId = router.query.id
    // const url = "https://" + context.host + router.asPath

    // const socket = useContext(SocketContext);

    // const { address } = useSelector((state: any) => ({
    //     address: state.account.address
    // }))

    // const {
    //     setAddress,
    //     setGameStatus,
    //     setOpponent,
    //     setPlayerStatus,
    //     setUrl,
    // } = useRematchDispatch((dispatch: any) => ({
    //     setAddress: dispatch.account.setAddress,
    //     setGameStatus: dispatch.game.setStatus,
    //     setOpponent: dispatch.account.setOpponent,
    //     setPlayerStatus: dispatch.account.setStatus,
    //     // setRoomInfo: dispatch.account.setRoomInfo,
    //     setUrl: dispatch.account.setUrl,
    // }))

    // async function connect() {
    //     try {
    //         await activate(injected)
    //     } catch (ex) {
    //         console.log(ex)
    //     }
    // }

    // useEffect(() => {
    //     setAddress(account)
    // }, [account])


    // useEffect(() => {
    //     // setRoomInfo({url, roomId})
    //     setUrl(url)

    // }, [url])

    useEffect(() => {
        socket.emit("view_init", address)
        // socket.on("connect", () => {
        //     console.log(socket.id); // x8WIv7-mJelg7on_ALbx
        //     if(address != '' && address != null) socket.emit("new_player", roomId, address)
        // });

        socket.on("ROOM_DATA", (room: any) => {
            // setGameOver(false)
            console.log("received - ", room); // world

            setRoundNo(room.roundNo)
            setRoundCount(room.roundCount)
            setPlayer1(room.player1)
            setPlayer2(room.player2)
            setViewers(room.viewers)

            setTimeout(() =>{
                // setGameOver(true)
            }, 3000)
        });

        socket.on("disconnect", () => {
            console.log(socket.id); // undefined
        });
    }, [address])

    console.log(roundNo, roundCount, " roundNo roundCount")

    return (
        roundNo != 0 ? (
            <div className="container mx-auto">
                <HeaderPanel />
                <div className='flex flex-row mt-5'>
                    <div className='relative basis-7/12 border-2 rounded-lg h-96'>
                        {
                            roundNo < roundCount ?
                                <>
                                    <div className='text-center'>
                                        <p className='text-3xl'>{player1.address}</p>
                                        {player1.pick == 0 && <p className='text-3xl'>Waiting P1</p>}
                                        {player1.pick == 1 && <button><Rock /></button>}
                                        {player1.pick == 2 && <button><Paper /></button>}
                                        {player1.pick == 3 && <button><Scissors /></button>}
                                    </div>

                                    <div className='absolute bottom-0 left-0 w-full'>
                                        <div className='text-center'>
                                            {player2.pick == 0 && <p className='text-3xl'>Waiting P2</p>}
                                            {player2.pick == 1 && <button><Rock /></button>}
                                            {player2.pick == 2 && <button><Paper /></button>}
                                            {player2.pick == 3 && <button><Scissors /></button>}
                                            <p className='text-3xl'>{player2.address}</p>
                                        </div>
                                    </div>
                                </> : <div className="text-center mt-30">
                                    {player1.winning >= player2.winning && <p className='text-3xl'>Player 1 Win</p>}
                                    {player1.winning < player2.winning && <p className='text-3xl'>Player 2 Win</p>}
                                </div>
                        }
                    </div>
                    <div className='basis-5/12 rounded-lg ml-3'>
                        <div className='border-2 rounded-lg h-32'>
                            <p className='text-3xl pl-3 border-2 rounded-lg'>Players</p>
                            <p className='text-2xl pl-3'>{ player1.address }</p>
                            <p className='text-2xl pl-3'>{ player2.address }</p>
                        </div>
                        <div className='border-2 rounded-lg h-64'>
                            <p className='text-3xl pl-3 border-2 rounded-lg'>Viewers</p>
                            { viewers.map((value, key) => {
                                return (
                                    <p key={ key } className='text-2xl pl-3'>{ value }</p>
                                )
                            }) }
                        </div>
                    </div>
                </div>
                {/* <p className="text-4xl text-center mt-40">{ gameStatus + " " + " " + roundStatus + " " + playerStatus }</p> */}
            </div>
        ) : (
            <p className='text-4xl text-center mt-40'>Please a moment...</p>
        )
    )
}

export default Viewer
