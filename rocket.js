// Rocket Visualization
document.addEventListener('DOMContentLoaded', function() {
    const visualization = document.getElementById('rocket-visualization');
    if (!visualization) return;
    
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    
    // Create rocket
    const rocket = document.createElement('div');
    rocket.className = 'rocket';
    rocket.innerHTML = `
        <div class="rocket-body"></div>
        <div class="rocket-nose"></div>
        <div class="rocket-fin"></div>
        <div class="rocket-wing"></div>
        <div class="rocket-window"></div>
        <div class="rocket-flame"></div>
        <div class="rocket-flame-inner"></div>
    `;
    visualization.appendChild(rocket);
    
    // Create black hole elements (purely visual)
    const blackHole = document.createElement('div');
    blackHole.className = 'black-hole';
    
    const accretionDisk = document.createElement('div');
    accretionDisk.className = 'black-hole-accretion';
    
    const blackHoleGlow = document.createElement('div');
    blackHoleGlow.className = 'black-hole-glow';
    
    visualization.appendChild(blackHoleGlow);
    visualization.appendChild(accretionDisk);
    visualization.appendChild(blackHole);
    
    // Rocket physics properties
    let rocketX = window.innerWidth / 2;
    let rocketY = window.innerHeight / 2;
    let rocketVX = 0;
    let rocketVY = 0;
    let rocketAngle = 0;
    const rocketAcceleration = 0.5;
    const rocketMaxSpeed = 8;
    const rocketRotationSpeed = 0.15;
    const rocketFriction = 0.97;
    
    // Create gravity wells (circles)
    const gravityWells = [];
    const numWells = 6;
    const gravityStrength = 0.4;
    const minWellDistance = 150;
    
    function createGravityWells() {
        // Clear existing wells
        gravityWells.length = 0;
        const wellElements = visualization.querySelectorAll('.gravity-well');
        wellElements.forEach(well => well.remove());
        
        for (let i = 0; i < numWells; i++) {
            const well = document.createElement('div');
            well.className = 'gravity-well';
            const size = Math.random() * 50 + 70;
            well.style.width = `${size}px`;
            well.style.height = `${size}px`;
            
            let validPosition = false;
            let attempts = 0;
            let x, y;
            
            while (!validPosition && attempts < 50) {
                x = Math.random() * (window.innerWidth - 200) + 100;
                y = Math.random() * (window.innerHeight - 200) + 100;
                
                validPosition = true;
                for (const existingWell of gravityWells) {
                    const dx = x - existingWell.x;
                    const dy = y - existingWell.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    if (distance < minWellDistance) {
                        validPosition = false;
                        break;
                    }
                }
                attempts++;
            }
            
            well.style.left = `${x - size/2}px`;
            well.style.top = `${y - size/2}px`;
            
            visualization.appendChild(well);
            gravityWells.push({
                element: well,
                x: x,
                y: y,
                radius: size/2
            });
        }
    }
    
    createGravityWells();
    
    // Update black hole position (purely visual)
    function updateBlackHole() {
        const size = 80; // Black hole size
        const glowSize = size * 2;
        
        blackHole.style.left = `${mouseX - size/2}px`;
        blackHole.style.top = `${mouseY - size/2}px`;
        blackHole.style.width = `${size}px`;
        blackHole.style.height = `${size}px`;
        
        accretionDisk.style.left = `${mouseX - size/2 - 15}px`;
        accretionDisk.style.top = `${mouseY - size/2 - 15}px`;
        accretionDisk.style.width = `${size + 30}px`;
        accretionDisk.style.height = `${size + 30}px`;
        
        blackHoleGlow.style.left = `${mouseX - glowSize/2}px`;
        blackHoleGlow.style.top = `${mouseY - glowSize/2}px`;
        blackHoleGlow.style.width = `${glowSize}px`;
        blackHoleGlow.style.height = `${glowSize}px`;
    }
    
    // Track mouse position
    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        updateBlackHole();
    });
    
    // Initialize black hole position
    updateBlackHole();
    
    // Animation loop
    function animate() {
        // Calculate angle to mouse
        const targetAngle = Math.atan2(mouseY - rocketY, mouseX - rocketX);
        
        // Smoothly rotate toward target
        let angleDiff = targetAngle - rocketAngle;
        
        // Normalize angle difference
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;
        
        rocketAngle += angleDiff * rocketRotationSpeed;
        
        // Apply acceleration
        rocketVX += Math.cos(rocketAngle) * rocketAcceleration;
        rocketVY += Math.sin(rocketAngle) * rocketAcceleration;
        
        // Apply gravity from wells only (no black hole gravity)
        gravityWells.forEach(well => {
            const dx = well.x - rocketX;
            const dy = well.y - rocketY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const minSafeDistance = well.radius + 30;
            
            if (distance < well.radius * 4) {
                let force;
                
                if (distance < minSafeDistance) {
                    force = -gravityStrength * 3 * (1 - distance / minSafeDistance);
                } else {
                    force = gravityStrength * 0.5 * (1 - distance / (well.radius * 4));
                }
                
                rocketVX += (dx / distance) * force;
                rocketVY += (dy / distance) * force;
            }
        });
        
        // REMOVED: Black hole gravity effect - now it's purely visual
        
        // Limit speed
        const speed = Math.sqrt(rocketVX * rocketVX + rocketVY * rocketVY);
        if (speed > rocketMaxSpeed) {
            rocketVX = (rocketVX / speed) * rocketMaxSpeed;
            rocketVY = (rocketVY / speed) * rocketMaxSpeed;
        }
        
        // Apply friction
        rocketVX *= rocketFriction;
        rocketVY *= rocketFriction;
        
        // Update position
        rocketX += rocketVX;
        rocketY += rocketVY;
        
        // Screen wrapping
        if (rocketX > window.innerWidth + 50) rocketX = -50;
        if (rocketX < -50) rocketX = window.innerWidth + 50;
        if (rocketY > window.innerHeight + 50) rocketY = -50;
        if (rocketY < -50) rocketY = window.innerHeight + 50;
        
        // Update rocket position
        rocket.style.left = `${rocketX - 30}px`;
        rocket.style.top = `${rocketY - 10}px`;
        rocket.style.transform = `rotate(${rocketAngle}rad)`;
        
        requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
    
    // Handle window resize
    window.addEventListener('resize', function() {
        createGravityWells();
        updateBlackHole();
        
        if (rocketX > window.innerWidth || rocketY > window.innerHeight) {
            rocketX = window.innerWidth / 2;
            rocketY = window.innerHeight / 2;
        }
    });
});