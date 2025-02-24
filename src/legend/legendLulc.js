const LegendLulc = () => {
    return (
        <div style={legendStyle}>
            <div style={legendItemStyle}>
                <div style={{ ...colorPill, backgroundColor: '#030364' }}></div>
                <span>Water body</span>
            </div>
            <div style={legendItemStyle}>
                <div style={{ ...colorPill, backgroundColor: '#C6B98B' }}></div>
                <span>Built-up</span>
            </div>
            <div style={legendItemStyle}>
                <div style={{ ...colorPill, backgroundColor: '#EA95E8' }}></div>
                <span>Barren land</span>
            </div>
            <div style={legendItemStyle}>
                <div style={{ ...colorPill, backgroundColor: '#0D4007' }}></div>
                <span>Forest</span>
            </div>
            <div style={legendItemStyle}>
                <div style={{ ...colorPill, backgroundColor: '#0EAB9B' }}></div>
                <span>Single Kharif</span>
            </div>
            <div style={legendItemStyle}>
                <div style={{ ...colorPill, backgroundColor: '#E2E51F' }}></div>
                <span>Single Non-Kharif</span>
            </div>
            <div style={legendItemStyle}>
                <div style={{ ...colorPill, backgroundColor: '#FF8845' }}></div>
                <span>Double Crop</span>
            </div>
            <div style={legendItemStyle}>
                <div style={{ ...colorPill, backgroundColor: '#CF1B1B' }}></div>
                <span>Triple Crop</span>
            </div>
        </div>
    );
};

export default LegendLulc;

const legendStyle = {
    position: 'absolute',
    top: '50%',
    right: '10px',
    transform: 'translateY(-60%)',
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