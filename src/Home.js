import React, { useState, useEffect, useRef } from 'react';
import { db } from "./firebase-config";

import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
// Dino Game Component
const DinoGame = () => {

  const usersCollectionRef = collection(db, "user");
  const [isJumping, setIsJumping] = useState(false); // Dino jump state
  const [dinoPosition, setDinoPosition] = useState(0); // Dino's vertical position
  const [obstaclePosition, setObstaclePosition] = useState(80); // Obstacle's horizontal position
  const [isGameOver, setIsGameOver] = useState(false); // Game Over state
  const [score, setScore] = useState(0); // Game Score
  const gameIntervalRef = useRef(null); // Ref to control the game loop
  const jumpHeight = 100; // Jump height for the Dino
  const gravity = 4; // Gravity effect
  const [coins,setCoins]=useState(0)
  const [highscore,setHighscore]=useState(0)
  const [start,setStart]=useState(false)
  // Handle Dino Jump
  const handleJump = () => {
    if (!isJumping) {
      setIsJumping(true);
      let jumpHeight = 0; // Track the current jump height

      const jumpInterval = setInterval(() => {
        if (jumpHeight < 100) {
            if(dinoPosition>=100)
                {
                    clearInterval(jumpInterval);
                    setIsJumping(false);
                }
          setDinoPosition(prevPosition => prevPosition + 4); // Move Dino up
          jumpHeight += 4; // Increment jump height tracker
        } else {
          clearInterval(jumpInterval);
          setIsJumping(false); // End jump once max height is reached
        }
      }, 20);
    }
  };


  // Game loop for moving obstacles and collision detection

  const dbsave=async ()=>{

    const userDoc = doc(db, "user", 'FGRO9QjOSO6xRTAfOp0E');
            const hscore=score>highscore?score:highscore
            const newFields = {chatId:'6737511792',friends:[""],username:"Krishna",otp:1234,highscore:hscore,referralCode:'1234',coins:score+coins };
            await updateDoc(userDoc, newFields);

  }

  const dbfetch=async ()=>{

    const data = await getDocs(usersCollectionRef);
    const dbdata=data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    setHighscore(dbdata[0].highscore)
    setCoins(dbdata[0].coins)
    console.log(dbdata[0].coins)
    // setScore(data[0].coins)
  }

  useEffect(() => {
    if (!isGameOver) {

        if(score==0)
            {
                dbfetch()
            }
      
            if(start)
                {
                    gameIntervalRef.current = setInterval(() => {
      
                        setObstaclePosition(prevPosition => {
                          const newPosition = prevPosition - 2;
                
                          if (newPosition < 0) {
                            setScore(prevScore => prevScore + 0.5); // Increase score when obstacle passes
                            return 100; // Reset obstacle position
                          }
                          
                          // Check collision
                          if (newPosition < 5 && newPosition > 0 && dinoPosition <= 50) {
                            
                            dbsave()
                            setIsGameOver(true);
                            setStart(false)
                
                            clearInterval(gameIntervalRef.current); // Stop game loop on collision
                          }
                
                          return newPosition;
                        });
                
                        // Apply gravity to Dino
                        setDinoPosition(prevPosition => {
                          if (!isJumping && prevPosition > 0) {
                            return prevPosition - gravity;
                          }
                          return prevPosition;
                        });
                      }, 20);
                }
       
     

      return () => clearInterval(gameIntervalRef.current); // Cleanup on component unmount
    }
  }, [isGameOver, dinoPosition, isJumping]);

  // Restart the game
  const restartGame = () => {
    setIsGameOver(false);
    setScore(0);
    setStart(true)
    setDinoPosition(0);
    setObstaclePosition(100);
  };

  return (
    <div>
        <div style={styles.gameContainer}>
   
    
      <div
        style={{
          ...styles.dino,
          bottom: `${dinoPosition}px`
        }}
      />
      <div
        style={{
          ...styles.obstacle,
          left: `${obstaclePosition}%`
        }}
      />
      {isGameOver && (
        <div style={styles.gameOver}>
          Game Over
         
        </div>
      )}
      
    </div>
    <br></br>
    <div >Coins: {score+coins}</div>
    <div >Score: {score}</div>
    <div >High Score: {highscore}</div>
    <br></br>
    <button onClick={restartGame} >Restart</button>
    <button onClick={handleJump} >
        Jump
      </button>
    </div>
    
  );
};

// CSS styles
const styles = {
  gameContainer: {
    position: 'relative',
    width: '600px',
    height: '200px',
    border: '2px solid black',
    overflow: 'hidden',
    backgroundColor: '#f7f7f7',
    margin: 'auto',
    marginTop: '50px'
  },
  dino: {
    position: 'absolute',
    width: '50px',
    height: '50px',
    backgroundColor: 'green',
    bottom: '0px',
    left: '50px'
  },
  obstacle: {
    position: 'absolute',
    width: '30px',
    height: '50px',
    backgroundColor: 'red',
    bottom: '0px'
  },
  jumpButton: {
    position: 'absolute',
    bottom: '20px',
    left: '250px',
    padding: '10px',
    cursor: 'pointer'
  },
  score: {
    position: 'absolute',
    top: '10px',
    left: '10px',
    fontSize: '18px',
    fontWeight: 'bold'
  },
  gameOver: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    fontSize: '24px',
    color: 'red'
  },
  restartButton: {
    marginTop: '10px',
    padding: '5px 10px',
    cursor: 'pointer'
  }
};

export default DinoGame;
