import { useContext, useEffect } from 'react'
import type { NextPage } from 'next'

import {SocketContext} from '../../shared/context/socket';

import { useSelector } from 'react-redux'
import { useRematchDispatch } from '../../shared/utils'
import { io } from "socket.io-client";

import Rock from '../Rock'
import Paper from '../Paper'
import Scissors from '../Scissors'

import { GameStatus } from '../../shared/models/game'
import { PlayerStatus } from '../../shared/models/account'
import { RoundStatus } from '../../shared/models/round'
import { RootModel } from '../../shared/models'

export const GamePanel: NextPage = () => {
  const socket = useContext(SocketContext);

  const { address, gameStatus, playerStatus, roundStatus } = useSelector((state: any) => ({
    address: state.account.address,
    gameStatus: state.game.status,
    playerStatus: state.account.status,
    roundStatus: state.round.status
  }))

  const { setPlayerStatus, setOpponent, setRoundStatus, setGameStatus } = useRematchDispatch((dispatch: any) => ({
    setGameStatus: dispatch.game.setStatus,
    setOpponent: dispatch.account.setOpponent,
    setPlayerStatus: dispatch.account.setStatus,
    setRoundStatus: dispatch.round.setStatus,
}))

  function pick(playerStatus: PlayerStatus) {
    setPlayerStatus(playerStatus);
    console.log("clicked");

    socket.emit('picked_from_client', address, playerStatus)
  }

  function retry() {
    setGameStatus(GameStatus.WaitingPlayer)
    setPlayerStatus(PlayerStatus.Piking)

    console.log("retry")
    socket.emit('retry')
  }

  const nextRound: Function = () => {
    return setTimeout(() => {
      console.log("===========")
      setGameStatus(GameStatus.WaitingPick)
      setRoundStatus(RoundStatus.None)
      setPlayerStatus(PlayerStatus.Piking)
    }, 3000)
  }

  useEffect(() => {

    const pickEventHandler = (room: any) => {
      console.log("rooem", room)
      if(room.player1.pick != 0 && room.player2.pick != 0) {
        setGameStatus(GameStatus.RoundOver)

        if(room.winner_address == address)
          setRoundStatus(RoundStatus.Win)
        else if(room.winner_address == '')
          setRoundStatus(RoundStatus.Tie)
        else setRoundStatus(RoundStatus.Lose)

        // eslint-disable-next-line react-hooks/exhaustive-deps
        nextRound()
      }
      else {
        setGameStatus(GameStatus.OpponentPicked)
      }
    }

    const disconnectEventHandler = () => {
      console.log("disconnected from opponent")
      setOpponent(null)
      setGameStatus(GameStatus.WaitingPlayer)
    }

    const gameOverEventHandler = (type: number) => {
      console.log("Your results ", type)
      // clearTimeout(nextRound())
      setGameStatus(GameStatus.GameOver)
      if(type == 1) setPlayerStatus(PlayerStatus.Win)
      else if(type == -1) setPlayerStatus(PlayerStatus.Lose)

      setTimeout(() => {
        setGameStatus(GameStatus.Retry)
      }, 2000)
    }

    const retryGameHandler = () => {
      console.log("retryGameHandler ")
      setGameStatus(GameStatus.WaitingPick)
    }

    socket.once('GAMEOVER', gameOverEventHandler)
    socket.once('picked_from_server', pickEventHandler)
    socket.once('disconnected', disconnectEventHandler)
    socket.once('retry', retryGameHandler)

    return () => {
      socket.off("picked_from_server", pickEventHandler);
      socket.off("disconnected", disconnectEventHandler);
    };
  })

  return (
    <>
        <div className="current_winning">
          <div className="your_winning"></div>
          <div className="opp_winning"></div>
        </div>
        { gameStatus == GameStatus.WaitingPlayer ? (
          <p className='text-4xl text-center mt-40'>Waiting Player...</p>
        ) : gameStatus == GameStatus.WaitingPick || gameStatus == GameStatus.OpponentPicked ? (
          <>
            { gameStatus == GameStatus.WaitingPick && <p className='text-2xl text-center'>Opponent are picking...</p>}
            { gameStatus == GameStatus.OpponentPicked && <p className='text-2xl text-center'>Opponent Picked!</p>}
            <div className='absolute bottom-0 left-0 w-full'>
              <div className='text-center'>
                  { playerStatus == PlayerStatus.Rock     && <button><Rock /></button>}
                  { playerStatus == PlayerStatus.Paper    && <button><Paper /></button>}
                  { playerStatus == PlayerStatus.Scissors && <button><Scissors /></button>}
              </div>
              <div className='flex flex-row text-3xl border-2 rounded-lg'>
                  <div className='basis-4/12 border-2 rounded-lg'>Pick a Hand</div>
                  <button onClick={ () => pick(PlayerStatus.Rock) } className='basis-3/12 text-center hover:bg-slate-800 border-r-2'>Rock</button>
                  <button onClick={ () => pick(PlayerStatus.Paper) } className='basis-3/12 text-center hover:bg-slate-800 border-r-2'>Paper</button>
                  <button onClick={ () => pick(PlayerStatus.Scissors) } className='basis-3/12 text-center hover:bg-slate-800'>Scissors</button>
              </div>
            </div>
          </>
        ) : gameStatus == GameStatus.RoundOver ? (
          <>
            { (roundStatus == RoundStatus.None) && "" }
            { (roundStatus == RoundStatus.Tie) && (<p className='text-4xl text-center mt-40'>Tie</p>) }
            { (roundStatus == RoundStatus.Win) && (<p className='text-4xl text-center mt-40'>Win</p>) }
            { (roundStatus == RoundStatus.Lose) && (<p className='text-4xl text-center mt-40'>Lose</p>) }
          </>
        ) : gameStatus == GameStatus.GameOver ? (
          <>
            <p className='text-3xl text-center mt-40'>Game Over</p>
            { (playerStatus == PlayerStatus.Win) && <p className='text-5xl text-center'>You are a Winer</p> }
            { (playerStatus == PlayerStatus.Lose) && <p className='text-5xl text-center'>Failed</p> }
          </>
        ) : gameStatus == GameStatus.Retry ? (
          <div className='text-center'>
            <button onClick={ () => retry() } className='py-2 mt-20 mb-4 text-lg font-bold rounded-lg w-56 bg-black text-white border-solid border-2 hover:bg-slate-800'>Retry</button>
          </div>
        ) : <></>}
    </>
  )
}
