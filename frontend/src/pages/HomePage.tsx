import React from 'react';
import { Link } from 'react-router-dom';
import './HomePage.css';

const HomePage: React.FC = () => {
    return (
        <div className="home-page">
            <div className="home-backdrop"></div>

            <div className="home-shell">
                {/* Hero Section */}
                <section className="home-card home-hero">
                    <span className="home-kicker">Question-Driven Learning</span>
                    <h1 className="home-title">
                        Vi-SlideS: <span>Adaptive Teaching Through Student Questions</span>
                    </h1>
                    <p className="home-subtitle">
                        Transform traditional lectures into question-driven, adaptive learning experiences. 
                        After a brief 5-10 minute topic introduction, students submit questions that shape class 
                        direction. AI analyzes collective questions and provides teachers with real-time insights 
                        into class mood, motivation, and conceptual understanding.
                    </p>

                    <div className="home-actions">
                        <Link to="/login" className="home-btn primary">
                            Get Started
                        </Link>
                    </div>
                </section>

                {/* Key Features */}
                <section className="home-card home-section">
                    <h2>Key Features</h2>
                    <div className="home-grid">
                        <article className="home-feature">
                            <h3>📝 Real-Time Question Submission</h3>
                            <p>Students submit questions after topic introduction. Choose anonymous or identified submissions and track question status.</p>
                        </article>
                        <article className="home-feature">
                            <h3>🤖 AI-Powered Analysis</h3>
                            <p>AI detects class mood, assesses motivation levels, classifies questions by cognitive complexity, and identifies learning gaps.</p>
                        </article>
                        <article className="home-feature">
                            <h3>⚡ Smart Triage</h3>
                            <p>Straightforward questions get instant AI responses with sources. Complex questions route to teacher's prioritized dashboard.</p>
                        </article>
                        <article className="home-feature">
                            <h3>📊 Real-Time Teacher Dashboard</h3>
                            <p>Comprehensive class insights, AI-prioritized questions, and suggested teaching direction. Override and review AI answers as needed.</p>
                        </article>
                    </div>
                </section>

                {/* System Workflow */}
                <section className="home-card home-section">
                    <h2>How It Works</h2>
                    <div className="home-workflow">
                        <div className="workflow-step">
                            <div className="step-number">1</div>
                            <h4>Pre-Class</h4>
                            <p>Teacher presents 5-10 minute topic overview. Students submit questions in real-time.</p>
                        </div>
                        <div className="workflow-step">
                            <div className="step-number">2</div>
                            <h4>AI Analysis</h4>
                            <p>System classifies by complexity, analyzes sentiment for mood/motivation, and creates understanding gist.</p>
                        </div>
                        <div className="workflow-step">
                            <div className="step-number">3</div>
                            <h4>Smart Response</h4>
                            <p>Auto-answers route straightforward questions; complex ones go to teacher dashboard.</p>
                        </div>
                        <div className="workflow-step">
                            <div className="step-number">4</div>
                            <h4>Post-Class</h4>
                            <p>Generate comprehensive analytics. Archive questions/answers for future reference.</p>
                        </div>
                    </div>
                </section>

                

                {/* Project Goals */}
                <section className="home-card home-section">
                    <h2>Project Goals</h2>
                    <div className="home-grid">
                        <article className="goal-item">
                            <h4>✨ Engagement</h4>
                            <p>Transform lectures into interactive experiences where student curiosity shapes class direction.</p>
                        </article>
                        <article className="goal-item">
                            <h4>📈 Real-Time Insights</h4>
                            <p>Provide teachers with actionable insights into understanding and engagement as it happens.</p>
                        </article>
                        <article className="goal-item">
                            <h4>🎯 Reduce Burden</h4>
                            <p>Automate responses to routine questions, letting teachers focus on complex discussions.</p>
                        </article>
                        <article className="goal-item">
                            <h4>🔍 Early Detection</h4>
                            <p>Identify learning gaps early and address problems before they become ingrained.</p>
                        </article>
                    </div>
                </section>

                {/* Authentication CTA */}
                <section className="home-card home-auth-cta">
                    <h2>Ready to Get Started?</h2>
                    <p>Students can directly login with Google. Teachers use verified signup with Teacher ID.</p>
                    <div className="home-actions">
                        <Link to="/login" className="home-btn primary">
                            Login
                        </Link>
                        <Link to="/register" className="home-btn secondary">
                            Teacher Sign Up
                        </Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default HomePage;
