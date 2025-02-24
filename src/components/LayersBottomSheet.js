import { BottomSheet } from 'react-spring-bottom-sheet';
import 'react-spring-bottom-sheet/dist/style.css';
import useLayersModal from "../hooks/useLayersModal";
import styles from "./LayersModal.module.css";

import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { purple } from '@mui/material/colors';
import { alpha, styled } from '@mui/material/styles';
import { useEffect, useState } from 'react';
import useMapLayers from '../hooks/useMapLayers';

const LayersBottomSheet = () => {

    const isOpen = useLayersModal((state) => state.isOpen)
    const onClose = useLayersModal((state) => state.onClose)
    const LayerStore = useMapLayers((state) => state);
    const [activeLayer, setActiveLayer] = useState([])

    useEffect(() => {

        if(LayerStore.isLayersPresent && LayerStore.Layers){
            let temp_layers = []

            Object.keys(LayerStore.Layers).forEach(function(key) {
                if(LayerStore.Layers[key]?.current?.getVisible?.()) {
                    temp_layers.push(key)
                }
            });

            setActiveLayer(temp_layers)
            LayerStore.updateStatus()
        }

    }, [LayerStore.isLayersPresent])
    

    if (!isOpen) {
        return null;
    }

    const PurpleSwitch = styled(Switch)(({ theme }) => ({
      '& .MuiSwitch-switchBase.Mui-checked': {
        color: purple[700],
        '&:hover': {
          backgroundColor: alpha(purple[700], theme.palette.action.hoverOpacity),
        },
      },
      '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
        backgroundColor: purple[700],
      },
    }));

    const IOSSwitch = styled((props) => (
        <Switch onChange={props.onChange} focusVisibleClassName=".Mui-focusVisible" disableRipple {...props} />
      ))(({ theme }) => ({
        width: 42,
        height: 26,
        padding: 0,
        '& .MuiSwitch-switchBase': {
          padding: 0,
          margin: 2,
          transitionDuration: '300ms',
          '&.Mui-checked': {
            transform: 'translateX(16px)',
            color: '#fff',
            '& + .MuiSwitch-track': {
              backgroundColor: theme.palette.mode === 'dark' ? '#2ECA45' : '#65C466',
              opacity: 1,
              border: 0,
            },
            '&.Mui-disabled + .MuiSwitch-track': {
              opacity: 0.5,
            },
          },
          '&.Mui-focusVisible .MuiSwitch-thumb': {
            color: '#33cf4d',
            border: '6px solid #fff',
          },
          '&.Mui-disabled .MuiSwitch-thumb': {
            color:
              theme.palette.mode === 'light'
                ? theme.palette.grey[100]
                : theme.palette.grey[600],
          },
          '&.Mui-disabled + .MuiSwitch-track': {
            opacity: theme.palette.mode === 'light' ? 0.7 : 0.3,
          },
        },
        '& .MuiSwitch-thumb': {
          boxSizing: 'border-box',
          width: 22,
          height: 22,
        },
        '& .MuiSwitch-track': {
          borderRadius: 26 / 2,
          backgroundColor: theme.palette.mode === 'light' ? '#E9E9EA' : '#39393D',
          opacity: 1,
          transition: theme.transitions.create(['background-color'], {
            duration: 500,
          }),
        },
      }));

    const header = (
        <div className={styles.header}>
            <div className={styles.modal_title}>
                Layers
            </div>
        </div>
    )

    const handleLayerToggle = (key) => {

        let temp_layers = []
        
        if(LayerStore.Layers[key]?.current?.getVisible?.()) {
            activeLayer.forEach((val) => {
                if(val !== key)
                    temp_layers.push(val)
            })
        }
        else {
            activeLayer.forEach((val) => {
                temp_layers.push(val)
            })
            temp_layers.push(key)
        }

        if (LayerStore.Layers[key]?.current?.setVisible) {
            LayerStore.Layers[key].current.setVisible(!LayerStore.Layers[key].current.getVisible());
        }

        setActiveLayer(temp_layers)
    }

    const body = (
        <div className={styles.body}>
            <div className={styles.body_header}>Select Active Layers</div>
            <hr className={styles.body_rule}/>
            <div className={styles.body_content}>
                <div className={styles.layer_buttons}>
                {Object.keys(LayerStore.Layers).map((key) =>{
                    return(
                        <div className={styles.layer_button} key={key}>
                            <FormControlLabel
                                control={<PurpleSwitch sx={{ m: 1 }} onChange={() => handleLayerToggle(key)} checked={activeLayer.includes(key)}/>}
                                label={key}
                                labelPlacement="bottom"
                                classes={{ label: styles.layer_button_label }}
                            />
                        </div>
                    )
                })
                }
                </div>
            </div>
        </div>
    )

    return (
        <>
            <BottomSheet open={isOpen} onDismiss={onClose} header={header} snapPoints={({ minHeight, maxHeight }) => [maxHeight/2, maxHeight/2]}>
                {body}
            </BottomSheet> 
        </>
    )

}

export default LayersBottomSheet