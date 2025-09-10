import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
// Import specific icons from lucide-react
import { Truck, BarChart2, TrendingUp, BellRing, ClipboardList, PackagePlus } from 'lucide-react'; // Added more icons

import './HomePage.css';

// --- IMPORTANT: IMAGE IMPORTS ---
// Make sure these paths are correct for your shop slideshow images
import shop1 from '../assets/shop1.jpg';
import shop2 from '../assets/shop2.jpg';
import shop3 from '../assets/shop3.jpg';
// import shop4 from './assets/shop4.jpg';

const shopImages = [shop1, shop2, shop3/*, shop4 */];

const HomePage = () => {
  const navigate = useNavigate();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % shopImages.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="home-container">
      <nav className="home-nav">
        <div className="home-nav-title">
          <Truck className="home-nav-icon" /> {/* You can keep the truck for the main title */}
          FertiStock
        </div>
        <Button
          onClick={() => navigate('/login')}
          className="home-nav-login-button"
        >
          Login
        </Button>
      </nav>

      <main className="home-main">
        <h1 className="home-welcome-title">Welcome to FertiStock</h1>
        <p className="home-welcome-subtitle">
          Track and manage fertilizer stock efficiently.
          <br />
          Real-time updates on inventory and notifications for restocking.
          <br />
          Built for Admins and Workers to streamline stock processes.
        </p>

        {/* Image Slideshow Section */}
        <div className="home-slideshow-container">
          <img
            src={shopImages[currentImageIndex]}
            alt="FertiStock Shop"
            className="slideshow-image current"
          />
          <img
            src={shopImages[(currentImageIndex + shopImages.length - 1) % shopImages.length]}
            alt="Previous FertiStock Shop"
            className="slideshow-image previous"
          />
          <img
            src={shopImages[(currentImageIndex + 1) % shopImages.length]}
            alt="Next FertiStock Shop"
            className="slideshow-image next"
          />
        </div>

        {/* Feature Cards Section - UPDATED ICONS */}
        <div className="home-features">
          <div className="home-feature-card">
            <div className="home-feature-icon">
              {/* Icon for Real-time Inventory Tracking */}
              <BarChart2 className="home-feature-truck-icon" /> {/* Changed from Truck */}
              {/* Alternative ideas: TrendingUp, LineChart, Gauge */}
            </div>
            <h3 className="home-feature-title">Real-time Inventory Tracking</h3>
            <p className="home-feature-description">
              Monitor your fertilizer stock levels live and stay updated always.
            </p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon">
              {/* Icon for Easy Stock Management */}
              <ClipboardList className="home-feature-truck-icon" /> {/* Changed from Truck */}
              {/* Alternative ideas: PackagePlus, Box, LayoutList */}
            </div>
            <h3 className="home-feature-title">Easy Stock Management</h3>
            <p className="home-feature-description">
              Add, update, and track fertilizer stock seamlessly with intuitive tools.
            </p>
          </div>

          <div className="home-feature-card">
            <div className="home-feature-icon">
              {/* Icon for Notification Alerts */}
              <BellRing className="home-feature-truck-icon" /> {/* Changed from Truck */}
              {/* Alternative ideas: AlertCircle, Mail, MessageSquare */}
            </div>
            <h3 className="home-feature-title">Notification Alerts</h3>
            <p className="home-feature-description">
              Get instant notifications when it's time to restock or take action.
            </p>
          </div>
        </div>
      </main>

      <footer className="home-footer">
        © {new Date().getFullYear()} FertiStock. All rights reserved.
      </footer>
    </div>
  );
};

export default HomePage;