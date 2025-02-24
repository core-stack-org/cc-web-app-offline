import { create } from "zustand";

const useNregaYears = create((set) => ({
    nregaYears : [],
    setNregaYears : (years) => set((state) => ({nregaYears : years}))   
}))

export default useNregaYears;