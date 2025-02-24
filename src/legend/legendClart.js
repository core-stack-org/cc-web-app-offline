const LegendClart = () => {
    return (
        <div style={legendStyle}>
            <div style={legendItemStyle}>
                <div style={{ ...colorPill, backgroundColor: '#F5F6FE' }}></div>
                <span>Empty</span>
            </div>
            <div style={legendItemStyle}>
                <div style={{ ...colorPill, backgroundColor: '#4EE323' }}></div>
                <span>Good recharge</span>
            </div>
            <div style={legendItemStyle}>
                <div style={{ ...colorPill, backgroundColor: '#F3FF33' }}></div>
                <span>Moderate recharge</span>
            </div>
            <div style={legendItemStyle}>
                <div style={{ ...colorPill, backgroundColor: '#F21223' }}></div>
                <span>Surface water harvesting</span>
            </div>
            <div style={legendItemStyle}>
                <div style={{ ...colorPill, backgroundColor: '#B40F7D' }}></div>
                <span>Regeneration</span>
            </div>
            <div style={legendItemStyle}>
                <div style={{ ...colorPill, backgroundColor: '#1774DE' }}></div>
                <span>High runoff zone</span>
            </div>
        </div>
    );
};

export default LegendClart;

const legendStyle = {
    position: 'absolute',
    top: '50%',
    right: '10px',
    transform: 'translateY(-80%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start', // This will align children to the left boundary
    backgroundColor: 'white',
    padding: '10px',
    borderRadius: '8px',
    boxShadow: '0px 0px 5px rgba(0,0,0,0.3)',
    width: 'auto', // Auto width to fit content
};

const legendItemStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start', 
    padding: '3px 7px',
    marginBottom: '5px',
    width: '70%', // 100% width to ensure content uses all available space
};

const colorPill = {
    borderRadius: '50%',
    width: '14px',
    height: '14px',
    marginBottom: '5px',
};