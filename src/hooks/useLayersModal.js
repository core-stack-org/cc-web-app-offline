import {create} from 'zustand'

const useLayersModal = create ((set) => ({
    isOpen : false,

    isWaterBodiesOpen : false,

    isAgriOpen : false,

    onOpen : () => set((state) => ({isOpen : true})),
    onClose : () => set((state) => ({isOpen : false})),

    onWaterBodiesOpen  : () => set((state) => ({isWaterBodiesOpen : true})),
    onWaterBodiesClose : () => set((state) => ({isWaterBodiesOpen : false})),

    onAgriOpen : () => set((state) => ({isAgriOpen : !state.isAgriOpen}))
}))

export default useLayersModal;