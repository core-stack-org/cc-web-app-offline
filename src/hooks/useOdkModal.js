import {create} from 'zustand'

const useOdkModal = create ((set) => ({
    isOpen : false,
    odkState : null,
    currentScreen : null,
    settlementName : null,
    isLoading : false,
    LayerUpdated : false,
    dbConnection : null,


    onOpen : () => set((state) => ({isOpen : true})),
    onClose : () => set((state) => ({isOpen : false})),
    onSetState : (redirectState) => set((state) => ({odkState : redirectState})),
    updateStatus : (screen) => set((state) => ({currentScreen : screen})),
    updateLoadingState : (status) => set((state) => ({isLoading : status})),
    updateLayerStatus : (status) => set((state) => ({LayerUpdated : status})),
    updateSettlementName : (name) => set((state) => ({settlementName : name})),
    updateDBConnection : (conn) => ({dbConnection : conn})
}))

export default useOdkModal;