export default async function getLayerUpdate(layerName) {
    try{
        const url_api = 'http://geoserver.gramvaani.org/post?layer_name='+layerName+'&block_name='+localStorage.getItem('block_name').toLowerCase()

        const response = await fetch(url_api)

        console.log(response)
    }catch(err){
        throw new Error(err)
    }
}