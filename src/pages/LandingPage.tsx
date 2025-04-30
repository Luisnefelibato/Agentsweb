import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import '../directStyles.css';
// Importamos las imágenes
import steveLogo from '../Steve.jpeg';
import sunpichLogo from '../Sunpich.jpeg';

const LandingPage = () => {
  return (
    <div className="landing-container">
      <motion.h1 
        className="welcome-heading" 
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8 }}
      >
        Bienvenido, William Mosquera
      </motion.h1>

      <div className="options-container">
        <Link to="/chat/steve">
          <motion.div 
            className="option-card steve-card"
            whileHover={{ scale: 1.1 }}
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <img 
              src={steveLogo} 
              alt="Steve Jobs" 
              className="agent-image"
            />
            <span className="agent-name">Steve Jobs - Estratega</span>
          </motion.div>
        </Link>

        <Link to="/chat/sunpich">
          <motion.div 
            className="option-card sunpich-card"
            whileHover={{ scale: 1.1 }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <img 
              src={sunpichLogo} 
              alt="Sundar Pichai" 
              className="agent-image"
            />
            <span className="agent-name">Sunpich - Innovador</span>
          </motion.div>
        </Link>
      </div>
      
      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-content">
          LuisFercode by Antares2025
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;