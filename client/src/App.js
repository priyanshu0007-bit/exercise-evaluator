import React, { useState } from 'react';
import './App.css';

function App() {
    const [exercise, setExercise] = useState(null);

    const startSquats = () => {
        setExercise('squats');
    };

    const startPushUps = () => {
        setExercise('push-ups');
    };

    return (
        <div className="App">
            <h1>Exercise Evaluation App</h1>
            <button onClick={startSquats}>Start Squats</button>
            <button onClick={startPushUps}>Start Push-Ups</button>

            {exercise && <p>Currently evaluating: {exercise}</p>}
        </div>
    );
}

export default App;

