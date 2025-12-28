import { motion } from "framer-motion";

const FloatingOrbs = () => {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Primary Cobalt Orb */}
      <motion.div
        className="orb orb-cobalt"
        style={{
          width: "500px",
          height: "500px",
          top: "10%",
          left: "15%",
        }}
        animate={{
          x: [0, 50, -30, 0],
          y: [0, -60, 40, 0],
          scale: [1, 1.1, 0.95, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Secondary Emerald Orb */}
      <motion.div
        className="orb orb-emerald"
        style={{
          width: "350px",
          height: "350px",
          bottom: "15%",
          right: "10%",
          opacity: 0.25,
        }}
        animate={{
          x: [0, -40, 30, 0],
          y: [0, 50, -40, 0],
          scale: [1, 0.9, 1.1, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Tertiary Plum Orb */}
      <motion.div
        className="orb orb-plum"
        style={{
          width: "400px",
          height: "400px",
          top: "50%",
          right: "25%",
          opacity: 0.2,
        }}
        animate={{
          x: [0, 60, -20, 0],
          y: [0, -30, 60, 0],
          scale: [1, 1.05, 0.98, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Small accent orbs */}
      <motion.div
        className="orb orb-cobalt"
        style={{
          width: "200px",
          height: "200px",
          bottom: "30%",
          left: "5%",
          opacity: 0.3,
        }}
        animate={{
          x: [0, 30, -20, 0],
          y: [0, -40, 30, 0],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="orb orb-emerald"
        style={{
          width: "250px",
          height: "250px",
          top: "5%",
          right: "30%",
          opacity: 0.15,
        }}
        animate={{
          x: [0, -30, 40, 0],
          y: [0, 30, -20, 0],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

export default FloatingOrbs;
