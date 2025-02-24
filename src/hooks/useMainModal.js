import {create} from 'zustand'

const useMainScreenModal = create ((set) => ({
    isOpen : false,

    //? Types of Modal open state
    locationModal : false,
    uploadKMLModal : false,
    generateDPR : false,
    nregaModal : false,
    changeLanguage : false,
    settlementInfo : false,
    formSubmissionModal : false,

    //? For Holding Data
    locationData : null,
    nregaBody : null,
    assetData : null,
    assetType : null,
    formType : null,

    //? For Handling Bug Report Modal
    BugReportModal : false,

    //* For opening and closing the Main Screen Modal
    onOpen : () => set((state) => ({isOpen : true})),
    onClose : () => set((state) => ({
        isOpen : false,
        locationModal: false,
        uploadKMLModal: false,
        generateDPR: false,
        nregaModal: false,
        changeLanguage: false,
        settlementInfo: false,
        formSubmissionModal: false,
        BugReportModal: false
    })),

    //* for location change Modal
    onSetState : (Data) => set((state) => ({locationData : Data})),
    onSetLocationModal : () => set((state) => ({
        locationModal : true,
        uploadKMLModal: false,
        generateDPR: false,
        nregaModal: false,
        changeLanguage: false,
        settlementInfo: false,
        formSubmissionModal: false,
        BugReportModal: false
    })),

    //* For KML upload Modal
    onSetUploadKML : () => set((state) => ({
        uploadKMLModal : true,
        locationModal: false,
        generateDPR: false,
        nregaModal: false,
        changeLanguage: false,
        settlementInfo: false,
        formSubmissionModal: false,
        BugReportModal: false
    })),

    //* For DPR generation Modal
    onSetGenerateDPR : () => set((state) => ({
        generateDPR : true,
        locationModal: false,
        uploadKMLModal: false,
        nregaModal: false,
        changeLanguage: false,
        settlementInfo: false,
        formSubmissionModal: false,
        BugReportModal: false
    })),

    //* For Language change Modal
    onSetLanguage : () => set((state) => ({
        changeLanguage : true,
        locationModal: false,
        uploadKMLModal: false,
        generateDPR: false,
        nregaModal: false,
        settlementInfo: false,
        formSubmissionModal: false,
        BugReportModal: false
    })),

    //* For NREGA Works Modal*/
    onSetNREGAWorks : () => set((state) => ({
        nregaModal : true,
        locationModal: false,
        uploadKMLModal: false,
        generateDPR: false,
        changeLanguage: false,
        settlementInfo: false,
        formSubmissionModal: false,
        BugReportModal: false
    })),
    onSetNregaBody : (NregaBody) => set((state) => ({nregaBody : NregaBody})),

    //* For Asset Info Display
    onSetSettlementInfo : (assetInfo) => set((state) => ({assetData : assetInfo})),
    onSetAssetType : (assetType) => set((state) => ({assetType : assetType})),
    onSettlementToggle : () => set((state) => ({
        settlementInfo : true,
        locationModal: false,
        uploadKMLModal: false,
        generateDPR: false,
        nregaModal: false,
        changeLanguage: false,
        formSubmissionModal: false,
        BugReportModal: false
    })),

    //* For Bug Report Modal
    onSetBugReportModal : () => set((state) => ({
        BugReportModal : true,
        locationModal: false,
        uploadKMLModal: false,
        generateDPR: false,
        nregaModal: false,
        changeLanguage: false,
        settlementInfo: false,
        formSubmissionModal: false
    })),

    //* For Form Submisson Modal
    onSetFormType : (name) => set((state) => ({formType : name})),
    onSetFormToggle : () => set((state) => ({
        formSubmissionModal : true,
        locationModal: false,
        uploadKMLModal: false,
        generateDPR: false,
        nregaModal: false,
        changeLanguage: false,
        settlementInfo: false,
        BugReportModal: false
    }))

}))

export default useMainScreenModal;