export const fetchTileInfo = () => {
    let tileInfo;
    let container_name = localStorage.getItem("container_name");
    
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://localhost:3000/containers/' + container_name + '/base_map_tiles/17/tileInfo.json', false);  // false makes it synchronous
    
    try {
      xhr.send();
      if (xhr.status === 200) {
        tileInfo = JSON.parse(xhr.responseText);
        return tileInfo;
      } else {
        throw new Error('Failed to load tileInfo.json');
      }
    } catch (error) {
      console.error('Error loading tileInfo:', error);
      return {
        error: true,
        message: error.message
      };
    }
  };