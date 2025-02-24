import {create} from 'zustand'

const useMapLayers = create ((set) => ({

    //? States For the KML upload Part
    customKML : false,
    setCustomKMLStatus : () => set((state) => ({customKML : !state.customKML})),

    //? Layers States in Object
    Layers : {},
    isLayersPresent : false,

    updateStatus : (status) => set((state) => ({isLayersPresent : status})),

    addLayersState : (Layer_name,Layer_state,Layers) => {
        let temp_layers = Layers

        temp_layers[Layer_name] = Layer_state

        set({Layers : temp_layers})
    },
    removeLayerState : (Layer_name,Layers) => {
        let temp_layers = {}

        let temp_keys = Object.keys(Layers)

        for (let key in temp_keys){
            if(key !== Layer_name){
                temp_layers[key] = Layers[key]
            }
        }

        set({Layers : temp_layers})
    },
    resetLayersState : () => {set({Layers : {}})},

    //? Common Layers Store

    //? Plan Based Layers Store
    currPlan : null,
    updateCurrPlan : (plan) => {set({currPlan : plan})},
    settlementLayer : null,
    updateSettlementLayer : (layer) => {set({settlementLayer : layer})},
    wellLayer : null,
    updateWellLayer : (layer) => {set({wellLayer : layer})},
    waterStructure : null,
    updateWaterStructure : (layer) => {set({waterStructure : layer})},
    
})) 

export default useMapLayers;