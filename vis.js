//visualization JavaScript for generating SVG content
document.addEventListener('DOMContentLoaded', function() {
    createDataVisualization();
    createCreativeArt();
    
    //click interaction to creative art
    document.getElementById('creativeArt').addEventListener('click', function() {
        regenerateCreativeArt();
    });
});

function createDataVisualization() {
    const container = document.getElementById('dataVisualization');
    const width = Math.min(800, container.clientWidth - 40);
    const height = 400;
    const margin = { top: 40, right: 40, bottom: 60, left: 60 };
    
    //https://gs.statcounter.com/os-market-share/desktop/worldwide
    const data = [
        { language: 'Windows', popularity: 72, color: '#f7df1e' },
        { language: 'Unknown', popularity: 11, color: '#3776ab' },
        { language: 'OSX', popularity: 8, color: '#ed8b00' },
        { language: 'MacOS', popularity: 4, color: '#3178c6' },
        { language: 'Linux', popularity: 3, color: '#239120' },
        { language: 'Chrome OS', popularity: 2, color: '#777bb4' },
    ];
    
    //SVG element bounds
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    //chart group
    const chartGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    chartGroup.setAttribute('transform', `translate(${margin.left}, ${margin.top})`);
    
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;
    
    //bars
    const barWidth = chartWidth / data.length * 0.8;
    const maxPopularity = Math.max(...data.map(d => d.popularity));
    const yScale = chartHeight / maxPopularity;
    
    data.forEach((item, index) => {
        const barHeight = item.popularity * yScale;
        const x = index * (chartWidth / data.length) + (chartWidth / data.length - barWidth) / 2;
        const y = chartHeight - barHeight;
        
        //bar singular
        const bar = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bar.setAttribute('x', x);
        bar.setAttribute('y', y);
        bar.setAttribute('width', barWidth);
        bar.setAttribute('height', barHeight);
        bar.setAttribute('fill', item.color);
        bar.setAttribute('rx', 4);
        bar.setAttribute('ry', 4);
        
        //mouse hover effect though I really did not end up doing anything with this
        bar.addEventListener('mouseover', function() {
            bar.style.opacity = '0.8';
            bar.style.cursor = 'pointer';
        });
        
        bar.addEventListener('mouseout', function() {
            bar.style.opacity = '1';
        });
        
        //value label
        const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        valueText.setAttribute('x', x + barWidth / 2);
        valueText.setAttribute('y', y - 5);
        valueText.setAttribute('text-anchor', 'middle');
        valueText.setAttribute('font-size', '12');
        valueText.setAttribute('fill', '#333');
        valueText.textContent = `${item.popularity}%`;
        
        //anguage label
        const langText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        langText.setAttribute('x', x + barWidth / 2);
        langText.setAttribute('y', chartHeight + 20);
        langText.setAttribute('text-anchor', 'middle');
        langText.setAttribute('font-size', '12');
        langText.setAttribute('fill', '#333');
        langText.textContent = item.language;
        
        chartGroup.appendChild(bar);
        chartGroup.appendChild(valueText);
        chartGroup.appendChild(langText);
    });
    
    // Create Y-axis
    const yAxis = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    
    // Y-axis line
    const yAxisLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    yAxisLine.setAttribute('x1', 0);
    yAxisLine.setAttribute('y1', 0);
    yAxisLine.setAttribute('x2', 0);
    yAxisLine.setAttribute('y2', chartHeight);
    yAxisLine.setAttribute('stroke', '#333');
    yAxisLine.setAttribute('stroke-width', 2);
    
    yAxis.appendChild(yAxisLine);
    
    //Y axis labels
    for (let i = 0; i <= maxPopularity; i += 20) {
        const y = chartHeight - (i * yScale);
        
        //tick mark
        const tick = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        tick.setAttribute('x1', -5);
        tick.setAttribute('y1', y);
        tick.setAttribute('x2', 0);
        tick.setAttribute('y2', y);
        tick.setAttribute('stroke', '#333');
        tick.setAttribute('stroke-width', 1);
        
        //label
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', -10);
        label.setAttribute('y', y + 4);
        label.setAttribute('text-anchor', 'end');
        label.setAttribute('font-size', '12');
        label.setAttribute('fill', '#333');
        label.textContent = `${i}%`;
        
        yAxis.appendChild(tick);
        yAxis.appendChild(label);
    }
    
    //title
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', width / 2);
    title.setAttribute('y', 25);
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('font-size', '18');
    title.setAttribute('font-weight', 'bold');
    title.setAttribute('fill', '#333');
    title.textContent = 'Desktop Popularity (%)';
    
    //Y axis label
    const yAxisLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    yAxisLabel.setAttribute('x', -chartHeight / 2);
    yAxisLabel.setAttribute('y', -35);
    yAxisLabel.setAttribute('text-anchor', 'middle');
    yAxisLabel.setAttribute('font-size', '14');
    yAxisLabel.setAttribute('fill', '#333');
    yAxisLabel.setAttribute('transform', 'rotate(-90)');
    yAxisLabel.textContent = 'Popularity (%)';
    
    chartGroup.appendChild(yAxis);
    chartGroup.appendChild(yAxisLabel);
    svg.appendChild(title);
    svg.appendChild(chartGroup);
    
    container.appendChild(svg);
}

//creative art masterpeice for all the ages
function createCreativeArt() {
    const container = document.getElementById('creativeArt');
    const width = Math.min(800, container.clientWidth - 40);
    const height = 400;
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', width);
    svg.setAttribute('height', height);
    svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
    
    //background
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('width', width);
    background.setAttribute('height', height);
    background.setAttribute('fill', 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)');
    svg.appendChild(background);
    
    //particle system variables
    const particles = [];
    const particleCount = 50;
    let mouseX = width / 2;
    let mouseY = height / 2;
    let animationId;
    
    //particles
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        
        // Random initial properties
        const size = Math.random() * 8 + 2;
        const hue = Math.random() * 360;
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 100 + 50;
        const speed = Math.random() * 0.05 + 0.02;
        
        particle.setAttribute('r', size);
        particle.setAttribute('fill', `hsla(${hue}, 70%, 60%, 0.7)`);
        
        //particle data for animation
        particles.push({
            element: particle,
            baseSize: size,
            angle: angle,
            distance: distance,
            speed: speed,
            sizePhase: Math.random() * Math.PI * 2, //pulsing animation
            hue: hue
        });
        
        svg.appendChild(particle);
    }
    
    //mouse move event listener
    svg.addEventListener('mousemove', function(event) {
        const rect = svg.getBoundingClientRect();
        mouseX = event.clientX - rect.left;
        mouseY = event.clientY - rect.top;
    });
    
    //mouse leave event reset to center
    svg.addEventListener('mouseleave', function() {
        mouseX = width / 2;
        mouseY = height / 2;
    });
    
    //animation function
    function animateParticles() {
        particles.forEach((particle, index) => {
            //update angle for orbital motion
            particle.angle += particle.speed;
            
            //position with orbit around mouse
            const x = mouseX + Math.cos(particle.angle) * particle.distance;
            const y = mouseY + Math.sin(particle.angle) * particle.distance;
            
            //size with pulsing effect
            particle.sizePhase += 0.05;
            const sizeVariation = Math.sin(particle.sizePhase) * 3;
            const currentSize = Math.max(1, particle.baseSize + sizeVariation);
            
            //particle properties
            particle.element.setAttribute('cx', x);
            particle.element.setAttribute('cy', y);
            particle.element.setAttribute('r', currentSize);
            
            //color based on movement and size
            const brightness = 50 + sizeVariation * 10;
            const opacity = 0.5 + (sizeVariation / 6) * 0.3;
            particle.element.setAttribute('fill', `hsla(${particle.hue}, 70%, ${brightness}%, ${opacity})`);
        });
        
        animationId = requestAnimationFrame(animateParticles);
    }
    
    //animation driver run point
    animateParticles();
    
    //title
    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('x', width / 2);
    title.setAttribute('y', 30);
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('font-size', '16');
    title.setAttribute('font-weight', 'bold');
    title.setAttribute('fill', 'white');
    title.textContent = 'Move mouse to interact with particles / Click to regenerate';
    
    svg.appendChild(title);
    
    container.appendChild(svg);
    svg._animationId = animationId;
}

function regenerateCreativeArt() {
    const container = document.getElementById('creativeArt');

    const oldSvg = container.querySelector('svg');
    if (oldSvg && oldSvg._animationId) {
        cancelAnimationFrame(oldSvg._animationId);
    }
    
    container.innerHTML = '';
    createCreativeArt();
}