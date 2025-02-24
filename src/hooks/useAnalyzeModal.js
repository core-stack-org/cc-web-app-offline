import {create} from 'zustand'

const useAnalyzeModal = create ((set) => ({
    isOpen : false,
    feature : null,
    onOpen : () => set((state) => ({isOpen : true})),
    onClose : () => set((state) => ({isOpen : false})),
    updateFeature : (feature) => set((state) => ({feature : feature}))
})) 

export default useAnalyzeModal;