import * as rootImports from "../helper/xmlRootAttributes"
import { api_url } from "../helper/constants";
import toast from "react-hot-toast";

export default async function getFormsSubmissions(screen_code) {
    try{

        const arrayString = await JSON.parse(localStorage.getItem(screen_code) || '[]');

        if(arrayString.length === 0){
            return;
        }

        let syncCheck = false;
        let urlMapping = {
            'add_Settlement_Form': "sync_offline_data/settlement/",
            'add_Well_Form': "sync_offline_data/well/",
            'add_Water_Structures_Form': "sync_offline_data/water_structures/",
        }
        let resourceMapping = {
            'add_Settlement_Form': "settlement",
            'add_Well_Form': "well",
            'add_Water_Structures_Form': "waterbody",
        }
        let payload = {
            layer_name: screen_code,
            resource_type: resourceMapping[screen_code],
            plan_id: localStorage.getItem("plan_id"),
            plan_name: screen_code,
            district_name: localStorage.getItem("dist_name"),
            block_name: localStorage.getItem("block_name"),
        };

        let xmlString = new XMLSerializer();

        let removalIdx = []

        // Add form data to XML
        let arrLen = arrayString.length
        let idx = 0;

        while(idx < arrLen){
            let formData = arrayString[idx];
            let xmlStr = rootImports[screen_code];
            let xmlParser = new DOMParser();
            let xmlroot = xmlParser.parseFromString(xmlStr, "text/xml");
            let xmlDoc = xmlroot.documentElement;

            let tempKeys = Object.keys(formData)

            tempKeys.forEach((item) => {
                    if (item === "GPS_point" && screen_code === "add_Settlement_Form") {
                        let newElement = xmlroot.createElement(item)
                        let childElement = xmlroot.createElement("point_mapsappearance")
                        childElement.textContent = `${formData[item]["longitude"]} ${formData[item]["latitude"]}`
                        newElement.appendChild(childElement)
                        xmlDoc.appendChild(newElement)
                    }
                    else if (item === "GPS_point"){
                        let newElement = xmlroot.createElement(item)
                        let childElement = xmlroot.createElement("point_mapappearance")
                        childElement.textContent = `${formData[item]["longitude"]} ${formData[item]["latitude"]}`
                        newElement.appendChild(childElement)
                        xmlDoc.appendChild(newElement)
                    }
                    else if(formData[item] !== null && Array.isArray(formData[item])){
                        let newElement = xmlroot.createElement(item)
                        let contentString = "";
                        formData[item].forEach((item) => {
                            if(contentString.length === 0){contentString = item;}
                            else{contentString = contentString + " " + item;}
                        })
                        newElement.textContent = contentString;
                        xmlDoc.appendChild(newElement);
                    }
                    else if (formData[item] !== null && typeof (formData[item]) === "object") {
                        const tempKeys = Object.keys(formData[item])
                        if(tempKeys !== null || tempKeys.length !== 0){
                            let newElement = xmlroot.createElement(item)
                            tempKeys.map((tempItem) => {
                            let childElement = xmlroot.createElement(tempItem)
                                childElement.textContent = `${formData[item][tempItem]}`
                                newElement.appendChild(childElement)
                            })
                            xmlDoc.appendChild(newElement)
                        }
                    }
                    else {
                        if(formData[item] !== null){
                            let newElement = xmlroot.createElement(item)
                            newElement.textContent = `${formData[item]}`
                            xmlDoc.appendChild(newElement)
                        }
                    }
            })
            console.log(xmlDoc)

            let tempString = xmlString.serializeToString(xmlDoc);
            

            console.log(`SYNCING URL: ${api_url}${urlMapping[screen_code]}`);
            const response = await fetch(`${api_url}${urlMapping[screen_code]}`, {
                method : "POST",
                headers: {
                    'Content-Type': 'application/xml',
                },
                body: tempString
            })

            let result = await response.json()

            if(result.sync_status){
                syncCheck = true
                removalIdx.push(idx);
                toast.success("Your submission synced successfully to ODK.");
            }

            idx++;
        }

        removalIdx.forEach((idx) => arrayString.splice(idx,1));

        let tempArr = JSON.stringify(arrayString)

        localStorage.setItem(screen_code, tempArr)

        if(syncCheck){
            await fetch(`${api_url}add_resources/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            })
            toast.success("The points marked on the map has been added to the layer. Download again to see them in Offline Mode.");
        }

    }catch(err){
        throw new Error(err)
    }
}