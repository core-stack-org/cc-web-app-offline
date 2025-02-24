const LegendMWS = () => {
    return (
        <div style={legendStyle}>
            <div style={legendItemStyle}>
                <div style={{ ...colorPill, backgroundColor: '#F49A00' }}></div>
                <span>Less than -500mm -</span>
            </div>
            <div style={legendItemStyle}>
                <div style={{ ...colorPill, backgroundColor: '#E6F70F' }}></div>
                <span>-500mm to -100mm</span>
            </div>
            <div style={legendItemStyle}>
                <div style={{ ...colorPill, backgroundColor: '#25B63C' }}></div>
                <span>-100mm to 100mm</span>
            </div>
            <div style={legendItemStyle}>
                <div style={{ ...colorPill, backgroundColor: '#1017F8' }}></div>
                <span>More than 100mm</span>
            </div>
        </div>
    );
};

export default LegendMWS;

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