import React from 'react';
import { Link } from 'react-router-dom';
import './LandingComponent.css';

function LandingComponent() {
    return (
        <>
            <div className='title'>
                <p>Wave Drive Experience the Future.</p>
            </div>

            <div className='cards-container'>
                <div className='cards'>

                    {/* Live Control Console Card */}
                    <div className='card'>
                        <div className="card-inner">
                            <div className="card-front">
                                <h3>Live Control Console</h3>
                                <p>
                                    Experience real-time gesture-based driving. Access the live camera feed,
                                    control your car with hand gestures, and explore the future of intuitive
                                    navigation.
                                </p>
                            </div>
                            <div className="card-back">
                                <p>Discover the future of driving. Try now!</p>
                                <Link to="/" className="btn">Go to Console</Link>
                            </div>
                        </div>
                    </div>

                    {/* Smart Codebase Editor Card */}
                    <div className='card'>
                        <div className="card-inner">
                            <div className="card-front">
                                <h3>Smart Codebase Editor</h3>
                                <p>
                                    Fine-tune gesture detection logic. Manually customize your gesture control
                                    code, or let AI assist you in creating a smarter driving experience.
                                </p>
                            </div>
                            <div className="card-back">
                                <p>Edit & enhance your gestures today!</p>
                                <Link to="/compiler" className="btn">Go to Editor</Link>
                            </div>
                        </div>
                    </div>

                    {/* Buy Kits Card */}
                    <div className='card'>
                        <div className="card-inner">
                            <div className="card-front">
                                <h3>Buy Gesture Control Car Kits</h3>
                                <p>
                                    Get your hands on high-quality kits to build and experiment with
                                    gesture-controlled cars. Perfect for developers, hobbyists, and students!
                                </p>
                            </div>
                            <div className="card-back">
                                <p>Order your kit now and start experimenting!</p>
                                <Link to="/kit" className="btn">Buy Kits Now</Link>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
}

export default LandingComponent;
